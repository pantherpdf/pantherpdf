/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { FunctionComponent } from 'react';
import type { ApiEndpoints, Name, ReportCompiled, Report } from '../types';
import type { FormulaHelper } from '../data/compile';
import type { GeneralProps } from '../editor/types';

/** Building blocks for editor */
export interface Widget {
  /** Unique widget id (type) */
  id: string;

  /** Human friendly name */
  name: Name;

  icon: IconDefinition;

  /** Create new instance of this widget */
  newItem: (props: ItemNewProps) => Promise<Item>;

  /** Compile item */
  compile: (item: any, helper: CompileHelper) => Promise<ItemCompiled>;

  /** Render properties editor */
  RenderProperties?: FunctionComponent<ItemRenderEditorProps>;

  /** Render item inside editor */
  RenderEditor: FunctionComponent<ItemRenderEditorProps>;

  /** Render item for final report */
  RenderPreview: FunctionComponent<ItemRenderPreviewProps>;

  /**
   * Can user add this widget to report? Default true.
   * Useful for helper Widgets which user should not manually manipulate.
   */
  canAdd?: boolean;

  /** Can user drag this widget to report (inside editor)? Default true. */
  canDrag?: boolean;

  /** Can user select Item by clicking ot it? Default true. */
  canSelect?: boolean;
}

/**
 * Instance of a Widget.
 * Reports are made out of multiple items. It contains data like text,
 * font-size, image url, margins etc.
 */
export interface Item {
  [key: string]: unknown;

  /** Id of a Widget */
  type: string;

  /** Subitems */
  children: Item[];
}

export interface ItemCompiled {
  [key: string]: unknown;
  type: string;
}

export interface ItemNewProps {
  report: Report;
}

export interface CompileHelper {
  formulaHelper: FormulaHelper;
  evalFormula: (txt: string) => Promise<unknown>;
  compileChildren: (
    children: Item[],
    helper: CompileHelper,
  ) => Promise<ItemCompiled[]>;

  /** Hierarchical index for current item */
  wid: number[];

  report: Report;
  reportCompiled: ReportCompiled;
  api: ApiEndpoints;
  externalHelpers: { [key: string]: any };
  variables: { [key: string]: unknown };
}

export interface ItemRenderEditorProps extends GeneralProps {
  item: Item;
  setItem: (itm: Item) => void;
  wid: number[];
}

export interface ItemRenderPreviewHelper {
  renderItem: (
    item: ItemCompiled,
    helper: ItemRenderPreviewHelper,
  ) => React.ReactNode;
  renderChildren: (
    chs: ItemCompiled[],
    helper: ItemRenderPreviewHelper,
  ) => React.ReactNode[];
  externalHelpers: { [key: string]: any };
}

export interface ItemRenderPreviewProps extends ItemRenderPreviewHelper {
  item: ItemCompiled;
}
