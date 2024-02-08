/**
 * @file Compile sourceData and report - evaluate all formulas
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import type {
  Report,
  ApiEndpoints,
  ReportCompiled,
  ReportProperties,
  ReportPropertiesCompiled,
  FormulaObject,
} from '../types';
import formulaEvaluate from '../formula/formula';
import { getWidget } from '../widgets/allWidgets';
import type { CompileHelper, Widget, WidgetItem } from '../widgets/types';
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
  externalHelpers: { [key: string]: unknown } = {},
): Promise<ReportCompiled> {
  // make a copy, to support changing
  report = JSON.parse(JSON.stringify(report));

  const formulaHelper = new FormulaHelper();
  formulaHelper.push('data', data);
  formulaHelper.push('report', report);
  const evalFormulaWrapper = async (val: FormulaObject): Promise<unknown> => {
    return formulaEvaluate(val.formula, formulaHelper);
  };

  // custom variables
  const vars: { [key: string]: unknown } = {};
  function getVarValue(varName: string): unknown {
    return vars[varName];
  }
  for (const v of report.variables) {
    vars[v.name] = evalFormulaWrapper(v.value);
    formulaHelper.push(v.name, getVarValue);
  }

  const propsCompiled = await compilePrprt(
    report.properties,
    evalFormulaWrapper,
  );

  const helper: CompileHelper = {
    wid: [],
    report: report,
    propertiesCompiled: propsCompiled,
    formulaHelper,
    api,
    variables: vars,
    externalHelpers,

    evalFormula: evalFormulaWrapper,

    compileChildren: async (children: WidgetItem[], helper: CompileHelper) => {
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

  const widgetsCompiled = await helper.compileChildren(report.widgets, helper);

  formulaHelper.pop();
  formulaHelper.pop();
  report.variables.map(() => formulaHelper.pop());
  if (formulaHelper.overrides.length !== 0) {
    throw new Error('helper has overrides still left inside');
  }

  return {
    widgets: widgetsCompiled,
    properties: propsCompiled,
  };
}

async function compilePrprt(
  prprt: ReportProperties,
  evalFormulaWrapper: (formula: FormulaObject) => Promise<unknown>,
): Promise<ReportPropertiesCompiled> {
  const obj: ReportPropertiesCompiled = {
    // make deep copy because widgets can change properties
    ...JSON.parse(JSON.stringify(prprt)),
    fileName: undefined,
    fontsUsed: [],
    globalCss: '',
  };
  if (prprt.fileName !== undefined) {
    const res = await evalFormulaWrapper(prprt.fileName);
    if (typeof res !== 'string') {
      throw new Error(
        `Filename should be a string, but received ${typeof res}`,
      );
    }
    obj.fileName = res;
  }
  if (prprt.font) {
    const style = PropertyFontExtractStyle(prprt.font);
    if (style) {
      obj.fontsUsed.push(style);
    }
  }
  return obj;
}
