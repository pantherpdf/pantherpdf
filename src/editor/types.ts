/**
 * @file Types used in report editor
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import type { ReactNode } from 'react';
import type { Report, ApiEndpoints } from '../types';
import { SourceData } from '../data/fetchSourceData';
import type { WidgetItem, Widget } from '../widgets/types';
import type { Transform } from '../transforms/types';

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
  sourceData?: SourceData;

  /** Override default transforms */
  transforms?: Transform[];

  /** Override default widgets */
  widgets?: Widget[];

  /** Navbar properties */
  navbar?: NavbarProps;
}

export type TDragObj =
  | { type: 'wid'; wid: number[] }
  | { type: 'widget'; widget: WidgetItem }
  | { type: 'widgets'; widgets: WidgetItem[] };

export interface GeneralProps extends EditorProps {
  selected: number[] | null;
  setSelected: React.Dispatch<React.SetStateAction<number[] | null>>;

  /** Override source data */
  sourceDataOverride?: SourceData;
  setSourceDataOverride: (dt: SourceData | undefined) => void;

  renderWidget: (child: WidgetItem, parents: number[]) => ReactNode;
  renderWidgets: (children: WidgetItem[], parents: number[]) => ReactNode;
  dragWidgetStart: (e: React.DragEvent<HTMLElement>, dragObj: TDragObj) => void;
  dragWidgetEnd: (e: React.DragEvent<HTMLElement>) => void;
  drop: (e: React.DragEvent<HTMLElement>, dest: number[]) => void;

  transforms: Transform[];
  widgets: Widget[];
  navbar: NavbarProps;
}
