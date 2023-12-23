/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import type { Transform, TransformItem } from './types';
import { getTransform } from './allTransforms';

/**
 * Function for calling all transformations
 * @param {unknown} inputData - Input data
 * @param {number} len - Number of transformations to apply
 */
export async function transformData(
  allTrans: Transform[],
  inputData: unknown,
  transformData: TransformItem[],
  len?: number,
): Promise<unknown> {
  if (len === undefined) {
    len = transformData.length;
  }
  for (let i = 0; i < len; ++i) {
    const w = transformData[i];
    const comp = getTransform(allTrans, w.type);
    inputData = await comp.transform(inputData, w);
  }
  return inputData;
}
