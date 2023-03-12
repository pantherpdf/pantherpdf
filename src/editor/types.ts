/**
 * types.ts
 * types used in report editor
 */

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { FunctionComponent, ReactNode, CSSProperties } from 'react';
import type { FormulaHelper } from './compile';
import {
  TReport,
  TData,
  TTransformData,
  ApiEndpoints,
  TDataCompiled,
  TReportCompiled,
} from '../types';

export type TName = string | { [key: string]: string };
export interface TFontAwesomeIcon {
  fontawesome: IconDefinition;
}

// to help construct tests
// to force specific children type
export type ForceChildren<T> =
  | T
  | { [key: string]: unknown; children: ForceChildren<T>[] };

export type ReportForceChildren<T> = TReport & { children: ForceChildren<T>[] };

export interface TSourceData {
  data: unknown;
  errorMsg?: string;
}

export type TDragObj =
  | { type: 'wid'; wid: number[] }
  | { type: 'widget'; widget: TData }
  | { type: 'widgets'; widgets: TData[] };

export interface GeneralProps {
  getOriginalSourceData: () => Promise<unknown>;
  overrideSourceData?: (data: unknown) => void;
  isOverridenSourceData: boolean;
  data: TSourceData;
  api: ApiEndpoints;

  report: TReport;
  setReport: (report: TReport) => Promise<void>;
  deleteReport?: () => void;

  selected: number[] | null;
  setSelected: React.Dispatch<React.SetStateAction<number[] | null>>;

  renderWidget: (child: TData, parents: number[]) => ReactNode;
  renderWidgets: (children: TData[], parents: number[]) => ReactNode;
  dragWidgetStart: (
    e: React.DragEvent<HTMLDivElement>,
    dragObj: TDragObj,
  ) => void;
  dragWidgetEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  drop: (e: React.DragEvent<HTMLDivElement>, dest: number[]) => void;
}

export interface ItemRendeProps extends GeneralProps {
  item: TData;
  setItem: (itm: TData) => void;
  wid: number[];
}

export interface ItemRendeFinalHelper {
  renderItem: (item: TDataCompiled, helper: ItemRendeFinalHelper) => string;
  renderChildren: (
    chs: TDataCompiled[],
    helper: ItemRendeFinalHelper,
  ) => string;
  externalHelpers: { [key: string]: any };
  escapeHtml: (txt: string) => string;
  styleToStringAttribute: (style: CSSProperties) => string;
}

export interface ItemRendeFinalProps extends ItemRendeFinalHelper {
  item: TDataCompiled;
}

export interface CompileHelper {
  formulaHelper: FormulaHelper;
  evalFormula: (txt: string) => Promise<unknown>;
  compileChildren: (
    arr1: TData[],
    helper: CompileHelper,
  ) => Promise<TDataCompiled[]>;
  wid: number[];
  report: TReport;
  reportCompiled: TReportCompiled;
  api: ApiEndpoints;
  externalHelpers: { [key: string]: any };
  variables: { [key: string]: unknown };
}

export interface NewItemProps {
  report: TReport;
}

export interface Widget {
  name: TName;
  icon: TFontAwesomeIcon;
  newItem: (props: NewItemProps) => Promise<TData>;
  compile: (dt: any, helper: CompileHelper) => Promise<TDataCompiled>;
  RenderProperties?: FunctionComponent<ItemRendeProps>;
  Render: FunctionComponent<ItemRendeProps>;
  RenderFinal: (props: ItemRendeFinalProps) => string;
  canAdd?: boolean;
  canDrag?: boolean;
  canSelect?: boolean;
}

export interface TransformRendeProps extends GeneralProps {
  item: TTransformData;
  setItem: (itm: TTransformData) => void;
  index: number;
}

export interface TTransformWidget {
  name: TName;
  newItem: () => Promise<TTransformData>;
  transform: (
    dt: unknown,
    item: TTransformData,
    allowUnsafeJsEval: boolean,
  ) => Promise<unknown>;
  Editor: FunctionComponent<TransformRendeProps>;
}
