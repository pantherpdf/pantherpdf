/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { FunctionComponent } from 'react';
import type { GeneralProps } from '../editor/types';
import type { TransName } from '../translation';
import type { ApiEndpoints } from '../types';
import type { FormulaHelper } from '../data/compile';

/** Instance of a Transform */
export interface TransformItem {
  [key: string]: unknown;
  type: string;
  comment: string;
}

export interface TransformEditorProps extends GeneralProps {
  item: TransformItem;
  setItem: (itm: TransformItem) => void;
  index: number;
}

export interface Transform {
  /** Unique transform id (type) */
  id: string;

  /** Human friendly name */
  name: TransName;

  icon: IconDefinition;

  /** Create new instance of this transform */
  newItem: () => Promise<TransformItem>;

  /**
   * Transform and return new data
   * @param previousData input data from previous step
   * @param item instance of Transform
   * @param helper
   * @returns transformed data
   */
  transform: (
    previousData: unknown,
    item: TransformItem,
    helper: TransformHelper,
  ) => Promise<unknown>;

  /** Render editor */
  Editor: FunctionComponent<TransformEditorProps>;
}

export interface TransformHelper {
  /** Index of current transform item */
  transformIndex: number;

  /** Evaluate formula */
  evalFormula: (txt: string) => Promise<unknown>;
  formulaHelper: FormulaHelper;

  api: ApiEndpoints;
}
