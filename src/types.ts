/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import type { CSSProperties } from 'react';
import type { TFont, TFontStyle } from './widgets/PropertyFont';

// helper for converting tuple into type
// prettier-ignore
type Narrowable =
  string | number | boolean | symbol | object | {} | void | null | undefined;
export const tuple = <T extends Narrowable[]>(...args: T) => args;

export type WithId<T> = T & { _id: string };

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

export const TargetOptions = tuple(
  'pdf',
  'html',
  'json',
  'csv-utf-8',
  'csv-windows-1250',
);
export type TargetOption = (typeof TargetOptions)[number];
export function TargetOptionTypeGuard(r: any): r is TargetOption {
  if (typeof r !== 'string') {
    return false;
  }
  if ((TargetOptions as string[]).indexOf(r) === -1) {
    return false;
  }
  return true;
}

export interface TransformItem {
  [key: string]: unknown;
  type: string;
  comment: string;
}

export interface TVariable {
  name: string;
  formula: string;
}

export interface ReportProperties {
  font?: TFont;
  margin?: [number, number, number, number];
  fileName?: string;
  paperWidth?: number;
  paperHeight?: number;
  lang?: string;
}

/**
 * Report type
 */
export interface Report {
  name: string;
  target: TargetOption;
  children: Item[];
  transforms: TransformItem[];
  properties: ReportProperties;
  dataUrl: string;
  variables: TVariable[];
}

/**
 * Report short summary
 */
export interface ApiReportMetaData {
  id: string;
  name: string;
}

export interface ItemCompiled {
  [key: string]: unknown;
  type: string;
}

export interface ReportCompiled extends Omit<Report, 'children'> {
  children: ItemCompiled[];
  fontsUsed: TFontStyle[];
  globalCss: string;
}

export function ItemTypeGuard(r: any): r is Item {
  if (typeof r.type !== 'string' || r.type.length === 0) {
    return false;
  }
  if (!Array.isArray(r.children)) {
    return false;
  }
  for (const ch of r.children) {
    if (!ItemTypeGuard(ch)) {
      return false;
    }
  }
  return true;
}

/**
 * Type guard for Report interface
 */
export function isReport(r: any): r is Report {
  if (typeof r != 'object' || !r) {
    return false;
  }
  if (typeof r.name !== 'string') {
    return false;
  }
  if (
    r.target !== 'pdf' &&
    r.target !== 'html' &&
    r.target !== 'json' &&
    r.target !== 'csv-utf-8' &&
    r.target !== 'csv-windows-1250'
  ) {
    return false;
  }
  if (!Array.isArray(r.children)) {
    return false;
  }
  for (const ch of r.children) {
    if (!ItemTypeGuard(ch)) {
      return false;
    }
  }
  if (typeof r.properties !== 'object' || !r.properties) {
    return false;
  }
  //
  if (typeof r.dataUrl !== 'string') {
    return false;
  }
  if (!Array.isArray(r.variables)) {
    return false;
  }
  if (!Array.isArray(r.transforms)) {
    return false;
  }
  return true;
}

/** Meta data when uploading a file */
export interface ApiUploadMetaData {
  /** File name */
  name: string;
  /** ISO format, UTC timezone */
  modifiedTime: string;
  /** Media type */
  mimeType: string;
}

/** Full meta data of a file */
export interface ApiFileMetaData extends ApiUploadMetaData {
  /** ISO format, UTC timezone */
  uploadTime: string;
  /** File size in bytes */
  size: number;
}

/** Access to optional external services */
export interface ApiEndpoints {
  /**
   * Get a list of all reports.
   *
   * Used to copy or embed one report into another.
   */
  allReports?: () => Promise<ApiReportMetaData[]>;

  /** Load full report to be copied or embedded */
  reportGet?: (id: string) => Promise<Report>;

  /**
   * Get a list of files
   *
   * Used primarily to share images between reports.
   */
  files?: () => Promise<ApiFileMetaData[]>;

  /** Delete a file */
  filesDelete?: (name: string) => Promise<void>;

  /** Upload a file */
  filesUpload?: (
    file: File,
    metaData: ApiUploadMetaData,
    progressCallback: (prc: number) => void,
  ) => Promise<void>;

  /** Url to a file. Used in browser and when rendering a pdf. */
  filesDownloadUrl?: (name: string) => string;

  /** Download a file */
  filesDownload?: (
    name: string,
  ) => Promise<{ data: ArrayBuffer; mimeType: string }>;

  /** To access metadata for all families served by Google Fonts */
  googleFontApiKey?: string;

  /**
   * Evaluate custom JavaScript code
   *
   * Code must include a return statement.
   * e.g. `function makeIt() { return { hello: 'world' }; } return makeIt();`
   */
  evaluateJavaScript?: (code: string) => Promise<unknown>;

  /** Used to generate PDF by generate() and by print preview */
  generatePdf?: (
    html: string,
    properties: ReportProperties,
  ) => Promise<Uint8Array>;
}

export const defaultReportCss: CSSProperties = {
  fontFamily: 'sans-serif',
  fontSize: '12pt',
  color: '#000000',
};
