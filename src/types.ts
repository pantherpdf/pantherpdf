import type { CSSProperties } from 'react';
import type { TFont, TFontStyle } from './widgets/PropertyFont';

// helper for converting tuple into type
// prettier-ignore
type Narrowable =
  string | number | boolean | symbol | object | {} | void | null | undefined;
export const tuple = <T extends Narrowable[]>(...args: T) => args;

export type WithId<T> = T & { _id: string };

export interface TData {
  [key: string]: unknown;
  type: string;
  children: TData[];
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

export interface TTransformData {
  [key: string]: unknown;
  type: string;
  comment: string;
}

export interface TVariable {
  name: string;
  formula: string;
}

export interface TReportProperties {
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
export interface TReport {
  _id: string;
  name: string;
  email: string;
  time: string;
  target: TargetOption;
  version: string;
  children: TData[];
  transforms: TTransformData[];
  properties: TReportProperties;
  dataUrl: string;
  variables: TVariable[];
}

/**
 * Report short summary
 */
export interface ApiReportMetaData {
  _id: string;
  name: string;
  target: TargetOption;
  version: string;
}

export interface TDataCompiled {
  [key: string]: unknown;
  type: string;
}

export interface TReportCompiled extends Omit<TReport, 'children'> {
  children: TDataCompiled[];
  fontsUsed: TFontStyle[];
  globalCss: string;
}

export function TDataTypeGuard(r: any): r is TData {
  if (typeof r.type !== 'string' || r.type.length === 0) {
    return false;
  }
  if (!Array.isArray(r.children)) {
    return false;
  }
  for (const ch of r.children) {
    if (!TDataTypeGuard(ch)) {
      return false;
    }
  }
  return true;
}

/**
 * Type guard for TReport interface
 */
export function isReport(r: any): r is TReport {
  if (typeof r != 'object' || !r) {
    return false;
  }
  if (typeof r._id !== 'string') {
    return false;
  }
  if (typeof r.email !== 'string') {
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
    if (!TDataTypeGuard(ch)) {
      return false;
    }
  }
  if (typeof r.properties !== 'object' || !r.properties) {
    return false;
  }
  // version
  if (typeof r.version !== 'string') {
    return false;
  }
  if (r.version.split('.').length !== 3) {
    return false;
  }
  //
  if (typeof r.time !== 'string') {
    return false;
  }
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
  reportGet?: (id: string) => Promise<TReport>;

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
   * Code must be an expression. Something which evaluates to a value.
   */
  evaluateJavaScript?: (code: string) => Promise<unknown>;

  /** Used to generate PDF by generateTarget() and by print preview */
  generatePdf?: (
    html: string,
    properties: TReportProperties,
  ) => Promise<Uint8Array>;
}

export const defaultReportCss: CSSProperties = {
  fontFamily: 'sans-serif',
  fontSize: '12pt',
  color: '#000000',
};
