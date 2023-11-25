/**
 * @file Types used in report editor
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { FunctionComponent, ReactNode } from 'react';
import type { FormulaHelper } from './compile';
import {
  Report,
  Item,
  TransformItem,
  ApiEndpoints,
  ItemCompiled,
  ReportCompiled,
} from '../types';

/**
 * Name is used for translating strings.
 * It can be `string` or `object` with 2-letter ISO language keys.
 */
export type Name = string | { [key: string]: string };

export interface SourceData {
  data: unknown;
  errorMsg?: string;
}

/** Navbar properties */
export interface NavbarProps {
  /** Show spinner in navbar (e.g. to indicate waiting on DB) */
  isBackendBusy?: boolean;

  /** Show undo and redo buttons */
  hasUndoRedo?: boolean;

  /** Undo callback. Set to undefined when undo is not possible. */
  undo?: () => void | Promise<void>;

  /** Redo callback. Set to undefined when redo is not possible. */
  redo?: () => void | Promise<void>;

  /** Component to display on the left side of navbar */
  left?: React.ReactNode;

  /** Component to display on the right side of navbar */
  right?: React.ReactNode;
}

/**
 * Properties for Editor component
 *
 * Editor is a controlled component. It takes its current value through `report`
 * and notifies changes through a callback `setReport`.
 */
export interface EditorProps {
  /** Editor layout */
  layout: 'fullscreen';

  /** Editors language. Default is "en". Use "en-us" to use imperial/US units. */
  language?: 'en' | 'en-us';

  /** Current value */
  report: Report;

  /**
   * Callback that report has changed
   *
   * Parent component needs to immediately update state to keep cursor in text
   * editor properly working.
   */
  setReport: (val: Report) => void | Promise<void>;

  /** API to external services for pdf generation, loading images, ... */
  api: ApiEndpoints;

  /** Optional source data to use while editing a report */
  sourceData?: unknown;

  /** Override default transforms */
  transforms?: Transform[];

  /** Override default widgets */
  widgets?: Widget[];

  /** Navbar properties */
  navbar?: NavbarProps;
}

// to help construct tests
// to force specific children type
export type ForceChildren<T> =
  | T
  | { [key: string]: unknown; children: ForceChildren<T>[] };

export type ReportForceChildren<T> = Report & { children: ForceChildren<T>[] };

export type TDragObj =
  | { type: 'wid'; wid: number[] }
  | { type: 'widget'; widget: Item }
  | { type: 'widgets'; widgets: Item[] };

// remove sourceData and replace it with getSourceData() that is also able to fetch from url
export interface GeneralProps extends Omit<EditorProps, 'sourceData'> {
  selected: number[] | null;
  setSelected: React.Dispatch<React.SetStateAction<number[] | null>>;

  /** Get unmodified source data */
  getSourceData: () => Promise<unknown>;

  /** Override source data */
  setSourceDataOverride?: (dt: unknown) => void;

  /** true when user uploads her own data or data is supplied via EditorProps.sourceData */
  isSourceDataOverriden: boolean;

  /** Transformed data */
  data: SourceData;

  renderWidget: (child: Item, parents: number[]) => ReactNode;
  renderWidgets: (children: Item[], parents: number[]) => ReactNode;
  dragWidgetStart: (e: React.DragEvent<HTMLElement>, dragObj: TDragObj) => void;
  dragWidgetEnd: (e: React.DragEvent<HTMLElement>) => void;
  drop: (e: React.DragEvent<HTMLElement>, dest: number[]) => void;

  transforms: Transform[];
  widgets: Widget[];
  navbar: NavbarProps;
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

export interface ItemNewProps {
  report: Report;
}

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
