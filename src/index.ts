// Parcel processes each file individually,
// so we need to explicitly reference .d.ts files
/// <reference types="./global" />
/// <reference types="./react-style-object-to-css" />

import Editor from './editor/Editor';
import type { EditorProps } from './editor/types';
import generateTarget from './editor/generateTarget';
import type { GenerateTargetArgs, FileOutput } from './editor/generateTarget';
import { isReport } from './types';
import type {
  TReport,
  ApiReportMetaData,
  ApiEndpoints,
  ApiFileMetaData,
  TReportProperties,
  ApiUploadMetaData,
} from './types';
import { setEditorLanguage } from './translation';
import { DataObj } from './editor/retrieveOriginalSourceData';

type Report = TReport;
type SourceData = DataObj;
type ReportProperties = TReportProperties;

export {
  // Frontend: React component
  Editor,
  // Backend
  generateTarget,
  // Other
  isReport,
  setEditorLanguage,
};

export type {
  EditorProps,
  GenerateTargetArgs,
  FileOutput,
  SourceData,
  //
  Report,
  ReportProperties,
  //
  ApiEndpoints,
  ApiReportMetaData,
  ApiFileMetaData,
  ApiUploadMetaData,
};
