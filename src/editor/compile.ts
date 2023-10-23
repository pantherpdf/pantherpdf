/**
 * @file Compile sourceData and report - evaluate all formulas
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import { Report, Item, ApiEndpoints } from '../types';
import type { ReportCompiled } from '../types';
import FormulaEvaluate from '../formula/formula';
import { getWidget } from '../widgets/allWidgets';
import { CompileHelper, Widget } from './types';
import { PropertyFontExtractStyle } from '../widgets/PropertyFont';

type TOvrr = [string, unknown];

export class FormulaHelper {
  overrides: TOvrr[];

  constructor() {
    this.overrides = [];
  }

  push(name: string, valueOrCb: unknown) {
    this.overrides.push([name, valueOrCb]);
  }

  pop() {
    this.overrides.pop();
  }

  async getVar(name: string): Promise<unknown> {
    for (let i = this.overrides.length - 1; i >= 0; --i) {
      if (this.overrides[i][0] === name) {
        let val = this.overrides[i][1];
        if (typeof val == 'function') {
          val = await val(name);
        }
        return val;
      }
    }
    return undefined;
  }
}

export default async function compile(
  report: Report,
  data: unknown,
  widgets: Widget[],
  api: ApiEndpoints,
  externalHelpers: { [key: string]: any } = {},
): Promise<ReportCompiled> {
  // make a copy, to support changing
  report = JSON.parse(JSON.stringify(report));

  const formulaHelper = new FormulaHelper();
  const getVar = formulaHelper.getVar.bind(formulaHelper);
  formulaHelper.push('data', data);
  formulaHelper.push('report', report);

  // custom variables
  const vars: { [key: string]: unknown } = {};
  function getVarValue(varName: string): unknown {
    return vars[varName];
  }
  for (const v of report.variables) {
    vars[v.name] = await FormulaEvaluate(v.formula, { getVar });
    formulaHelper.push(v.name, getVarValue);
  }

  let dt2: ReportCompiled = {
    ...report,
    children: [],
    fontsUsed: [],
    globalCss: '',
  };
  dt2 = JSON.parse(JSON.stringify(dt2));
  if (dt2.properties.font) {
    const style = PropertyFontExtractStyle(dt2.properties.font);
    if (style) {
      dt2.fontsUsed.push(style);
    }
  }

  if (dt2.properties.fileName) {
    const res = await FormulaEvaluate(dt2.properties.fileName, { getVar });
    if (typeof res !== 'string') {
      throw new Error(
        `Filename should be a string, but received ${typeof res}`,
      );
    }
    dt2.properties.fileName = res;
  }

  const helper: CompileHelper = {
    wid: [],
    report: report,
    reportCompiled: dt2,
    formulaHelper,
    api,
    variables: vars,
    externalHelpers,

    evalFormula: async (txt: string) => {
      return FormulaEvaluate(txt, { getVar });
    },

    compileChildren: async (children: Item[], helper: CompileHelper) => {
      // dont use promise.all() because order of execution matters and some async operation could change it
      const arr2 = [];
      for (let i = 0; i < children.length; ++i) {
        const ch = children[i];
        const helper2 = { ...helper, wid: [...helper.wid, i] };
        const dt = await getWidget(widgets, ch.type).compile(ch, helper2);
        arr2.push(dt);
      }
      return arr2;
    },
  };

  dt2.children = await helper.compileChildren(report.children, helper);

  formulaHelper.pop();
  formulaHelper.pop();
  report.variables.map(() => formulaHelper.pop());
  if (formulaHelper.overrides.length !== 0) {
    throw new Error('helper has overrides still left inside');
  }
  return dt2;
}
