/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { FunctionComponent } from 'react';
import type { GeneralProps } from '../editor/types';
import type { Name } from '../types';

export interface TransformItem {
  [key: string]: unknown;
  type: string;
  comment: string;
}

export interface TransformRenderProps extends GeneralProps {
  item: TransformItem;
  setItem: (itm: TransformItem) => void;
  index: number;
}

export interface Transform {
  id: string;
  name: Name;
  icon: IconDefinition;
  newItem: () => Promise<TransformItem>;
  transform: (dt: unknown, item: TransformItem) => Promise<unknown>;
  RenderEditor: FunctionComponent<TransformRenderProps>;
}
