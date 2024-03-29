/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { FunctionComponent } from 'react';
import type {
  ApiEndpoints,
  FormulaObject,
  Report,
  ReportPropertiesCompiled,
} from '../types';
import type { FormulaHelper } from '../data/compile';
import type { GeneralProps } from '../editor/types';
import type { TransName } from '../translation';
import { FontStyle } from './PropertyFont';

/** Building blocks for editor */
export interface Widget {
  /** Unique widget id (type) */
  id: string;

  /** Human friendly name */
  name: TransName;

  icon: IconDefinition;

  /** Create new instance of this widget */
  newItem: (props: WidgetNewProps) => Promise<WidgetItem>;

  /** Compile item */
  compile: (item: WidgetItem, helper: CompileHelper) => Promise<WidgetCompiled>;

  /** Render properties editor */
  Properties?: FunctionComponent<WidgetEditorProps>;

  /** Render item inside editor */
  Editor: FunctionComponent<WidgetEditorProps>;

  /** Render item for final report */
  Preview: FunctionComponent<WidgetPreviewProps>;

  /**
   * Can user add this widget to report? Default true.
   * Useful for helper Widgets which user should not manually manipulate.
   */
  canAdd?: boolean;

  /** Can user drag this widget to report (inside editor)? Default true. */
  canDrag?: boolean;

  /** Can user select Item by clicking ot it? Default true. */
  canSelect?: boolean;

  /** Get fonts used in this item */
  getFontsUsed?: (
    parentFont: FontStyle,
    item: WidgetItem,
  ) => FontStyle | FontStyle[];
}

/**
 * Instance of a Widget.
 * Reports are made out of multiple items. It contains data like text,
 * font-size, image url, margins etc.
 */
export interface WidgetItem {
  [key: string]: unknown;

  /** Id of a Widget */
  type: string;

  /** Subitems */
  children: WidgetItem[];
}

export interface WidgetCompiled {
  [key: string]: unknown;
  type: string;
}

export interface WidgetNewProps {
  report: Report;
}

export interface CompileHelper {
  formulaHelper: FormulaHelper;
  evalFormula: (val: FormulaObject) => Promise<unknown>;
  compileChildren: (
    children: WidgetItem[],
    helper: CompileHelper,
  ) => Promise<WidgetCompiled[]>;

  /** Hierarchical index for current item */
  wid: number[];

  report: Report;
  propertiesCompiled: ReportPropertiesCompiled;
  api: ApiEndpoints;
  externalHelpers: { [key: string]: unknown };
  variables: { [key: string]: unknown };
}

export interface WidgetEditorProps extends GeneralProps {
  item: WidgetItem;
  setItem: (itm: WidgetItem) => void;
  wid: number[];
}

export interface WidgetPreviewProps {
  renderItem: (
    item: WidgetCompiled,
    props: WidgetPreviewPropsBase,
  ) => React.ReactNode;
  renderChildren: (
    chs: WidgetCompiled[],
    props: WidgetPreviewPropsBase,
  ) => React.ReactNode[];
  externalHelpers: { [key: string]: unknown };
  item: WidgetCompiled;
}

export type WidgetPreviewPropsBase = Omit<WidgetPreviewProps, 'item'>;
