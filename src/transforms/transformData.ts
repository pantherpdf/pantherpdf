/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import type { Transform, TransformHelper, TransformItem } from './types';
import type { ApiEndpoints } from '../types';
import { getTransform } from './allTransforms';
import { FormulaHelper } from '../data/compile';
import FormulaEvaluate from '../formula/formula';

/**
 * Function for calling all transformations
 * @param {unknown} inputData - Input data
 * @param {number} len - Number of transformations to apply
 */
export async function transformData(
  allTrans: Transform[],
  inputData: unknown,
  transformData: TransformItem[],
  api: ApiEndpoints,
  len = -1,
): Promise<unknown> {
  if (len < 0) {
    len = transformData.length;
  }
  for (let i = 0; i < len; ++i) {
    const formulaHelper = new FormulaHelper();
    const getVar = formulaHelper.getVar.bind(formulaHelper);
    const helper: TransformHelper = {
      transformIndex: i,
      evalFormula: async (txt: string) => {
        return FormulaEvaluate(txt, { getVar });
      },
      formulaHelper,
      api,
    };

    const w = transformData[i];
    const comp = getTransform(allTrans, w.type);
    inputData = await comp.transform(inputData, w, helper);
  }
  return inputData;
}
