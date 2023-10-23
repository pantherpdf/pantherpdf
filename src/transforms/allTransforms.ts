/**
 * @file List of all transforms
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import type { Transform } from '../editor/types';
import { Filter } from './Filter';
import { CSV } from './CSV';

export const defaultTransforms: Transform[] = [Filter, CSV];

export function getTransform(arr: Transform[], id: string): Transform {
  const obj = arr.find(x => x.id === id);
  if (!obj) {
    throw new Error(`Transform '${id}' does not exist`);
  }
  return obj;
}
