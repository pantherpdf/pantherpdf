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

export interface TReport {
  _id: string;
  name: string;
  email: string;
  time: string;
  target: TargetOption;
  version: string;
  children: TData[];
  transforms: TTransformData[];
  properties: {
    font?: TFont;
    margin?: [number, number, number, number];
    fileName?: string;
    paperWidth?: number;
    paperHeight?: number;
    lang?: string;
  };
  dataUrl: string;
  variables: TVariable[];
}

export interface TReportShort {
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

export function ReportTypeGuard(r: any): r is TReport {
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

export interface TFileShort {
  name: string;
  mimeType: string;
  uploadTime: string;
  modifiedTime: string;
  size: number;
}

export interface FileUploadData {
  name: string;
  modifiedTime: string;
  mimeType: string;
}

export interface GeneratePdfRequest {
  reportId: string;
  dataUrl?: string;
  data?: unknown;
}

export interface GeneratePdfResponse {
  fileName: string;
  data: Uint8Array;
}

export type FilesResponseBase = { files: TFileShort[] };
export interface ApiEndpoints {
  reportGet?: (id: string) => Promise<TReport>;
  files?: () => Promise<FilesResponseBase>;
  filesDelete?: (name: string) => Promise<void>;
  filesUpload?: (
    file: File,
    data: FileUploadData,
    cbProgress: (prc: number) => void,
  ) => Promise<void>;
  filesDownloadUrl?: (name: string) => string;
  filesDownload?: (
    name: string,
  ) => Promise<{ data: ArrayBuffer; mimeType: string }>;
  allReports?: () => Promise<TReportShort[]>;
  googleFontApiKey?: string;
  generatePdf?: (req: GeneratePdfRequest) => Promise<GeneratePdfResponse>;
}

export const defaultReportCss: CSSProperties = {
  fontFamily: 'sans-serif',
  fontSize: '12pt',
  color: '#000000',
};
