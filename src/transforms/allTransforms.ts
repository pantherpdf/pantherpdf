/**
 * allTransforms.tsx
 * list of all widgets
 */

import type { TTransformWidget } from '../editor/types';
import { Filter } from './Filter';
import { CSV } from './CSV';

export const allTransforms: { [key: string]: TTransformWidget } = {
  Filter,
  CSV,
};

export default function getTransform(type: string): TTransformWidget {
  const c = allTransforms[type];
  if (c !== undefined) {
    return c;
  }
  throw new Error(`Missing transform ${type}`);
}
