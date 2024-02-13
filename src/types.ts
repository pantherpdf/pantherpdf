/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import type { CSSProperties } from 'react';
import type { Font, FontStyle } from './widgets/PropertyFont';
import type { WidgetItem, WidgetCompiled } from './widgets/types';
import type { TransformItem } from './transforms/types';

// helper for converting tuple into type
// prettier-ignore
type Narrowable =
  string | number | boolean | symbol | object | NonNullable<unknown> | void | null | undefined;
export const tuple = <T extends Narrowable[]>(...args: T) => args;

export interface Variable {
  name: string;
  value: FormulaObject;
}

/** Paper properties, units are mm */
export interface Paper {
  margin?: [number, number, number, number];
  width?: number;
  height?: number;
}

export interface GenerateResultProperties {
  paper?: Paper;
  fileName?: string;
}

export interface ReportProperties
  extends Omit<GenerateResultProperties, 'fileName'> {
  font?: Font;
  lang?: string;
  fileName?: FormulaObject;
}

export interface ReportPropertiesCompiled
  extends Omit<ReportProperties, 'fileName'> {
  fileName?: string;
  fontsUsed: FontStyle[];
  globalCss: string;
}

export interface GenerateResult {
  html: string;
  properties: GenerateResultProperties;
}

/**
 * Report type
 */
export interface Report {
  widgets: WidgetItem[];
  transforms: TransformItem[];
  properties: ReportProperties;
  variables: Variable[];
}

/**
 * Report short summary
 */
export interface ApiReportMetaData {
  id: string;
  name: string;
}

export interface ReportCompiled {
  widgets: WidgetCompiled[];
  properties: ReportPropertiesCompiled;
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

/**
 * Access to optional external services.
 * Experimental. Subject to change without a notice.
 */
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

  /** Font service */
  fonts?: {
    /** List of available font names */
    list: string[];
    /** Retrieve URL to font CSS or null for system fonts */
    getCssUrls: (fontsUsed: FontStyle[]) => string[];
  };

  /** Used by print preview to generate PDF */
  generatePdf?: (report: GenerateResult) => Promise<Uint8Array>;
}

export const defaultReportCss: CSSProperties = {
  fontFamily: 'sans-serif',
  fontSize: '12pt',
  color: '#000000',
};

/**
 * Object representing a formula.
 * Used to distinguish between literal strings and formulas.
 */
export type FormulaObject = { formula: string };
