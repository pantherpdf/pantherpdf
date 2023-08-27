/**
 * types.ts
 * types used in report editor
 */

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { FunctionComponent, ReactNode, CSSProperties } from 'react';
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

/**
 * Properties for Editor component
 *
 * Editor is a controlled component. It takes its current value through `report`
 * and notifies changes through a callback `setReport`.
 */
export interface EditorProps {
  /** Current value */
  report: Report;

  /**
   * Callback that report has changed
   *
   * Parent component needs to immediately update state to keep cursor in text
   * editor properly working.
   */
  setReport: (val: Report) => Promise<void>;

  /** API to external services for pdf generation, loading images, ... */
  api: ApiEndpoints;

  /** Optional source data to use while editing a report */
  sourceData?: unknown;

  /** Flag to indicate progress while saving a report to a DB */
  isBackendBusy?: boolean;

  /** Show undo and redo buttons */
  hasUndoRedo: boolean;

  /** Undo callback. Should not be defined when undo is not possible. */
  undo?: () => void;

  /** Redo callback. Should not be defined when redo is not possible. */
  redo?: () => void;

  /** Link to home button */
  homeLink?: {
    text: string;
    url: string;
  };

  /** Override default transforms */
  transforms?: Transform[];

  /** Override default widgets */
  widgets?: Widget[];
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
  dragWidgetStart: (
    e: React.DragEvent<HTMLDivElement>,
    dragObj: TDragObj,
  ) => void;
  dragWidgetEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  drop: (e: React.DragEvent<HTMLDivElement>, dest: number[]) => void;

  transforms: Transform[];
  widgets: Widget[];
}

export interface ItemRenderEditorProps extends GeneralProps {
  item: Item;
  setItem: (itm: Item) => void;
  wid: number[];
}

export interface ItemRenderPreviewHelper {
  renderItem: (item: ItemCompiled, helper: ItemRenderPreviewHelper) => string;
  renderChildren: (
    chs: ItemCompiled[],
    helper: ItemRenderPreviewHelper,
  ) => string;
  externalHelpers: { [key: string]: any };
  escapeHtml: (txt: string) => string;
  styleToStringAttribute: (style: CSSProperties) => string;
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
  RenderPreview: (props: ItemRenderPreviewProps) => string;

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
  newItem: () => Promise<TransformItem>;
  transform: (dt: unknown, item: TransformItem) => Promise<unknown>;
  RenderEditor: FunctionComponent<TransformRenderProps>;
}
