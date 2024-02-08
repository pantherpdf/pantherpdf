/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2024
 * @license MIT
 */

import { FormulaHelper } from '../data/compile';
import formulaEvaluate from '../formula/formula';
import { FormulaObject } from '../types';
import { Filter, FilterData } from './Filter';
import { TransformHelper } from './types';

const formulaHelper = new FormulaHelper();
const helper: TransformHelper = {
  transformIndex: 0,
  evalFormula: (val: FormulaObject) =>
    formulaEvaluate(val.formula, formulaHelper),
  formulaHelper,
  api: {},
};

test('should filter big numbers', async () => {
  const dt = { myArr: [1, 2, 3, 4, 5, 6, 7, 8, 9] };
  const item: FilterData = {
    type: 'Filter',
    comment: '',
    field: { formula: 'data.myArr' },
    condition: { formula: 'item < 5' },
  };
  const res = await Filter.transform(dt, item, helper);
  expect(res === dt).toBeTruthy(); // should change input object
  expect((res as typeof dt).myArr).toEqual([1, 2, 3, 4]);
  expect(helper.formulaHelper.overrides.length).toBe(0);
});
