/**
 * allTransforms.tsx
 * list of all transforms
 */

import type { TTransformWidget } from '../editor/types';
import { Filter } from './Filter';
import { CSV } from './CSV';

export const defaultTransforms: TTransformWidget[] = [Filter, CSV];

export function getTransform(
  arr: TTransformWidget[],
  id: string,
): TTransformWidget {
  const obj = arr.find(x => x.id === id);
  if (!obj) {
    throw new Error(`Transform '${id}' does not exist`);
  }
  return obj;
}
