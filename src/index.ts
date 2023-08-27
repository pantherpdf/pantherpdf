// Parcel processes each file individually,
// so we need to explicitly reference .d.ts files
/// <reference types="./global" />
/// <reference types="./react-style-object-to-css" />

import Editor from './editor/Editor';
import type {
  CompileHelper,
  EditorProps,
  ItemRendeFinalHelper,
  ItemRendeFinalProps,
  ItemRendeProps,
  NewItemProps,
  TFontAwesomeIcon,
  TName,
  TransformRendeProps,
  TTransformWidget,
  Widget,
} from './editor/types';
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
  TargetOption,
  TTransformData,
  TData,
  TDataCompiled,
} from './types';
import { setEditorLanguage } from './translation';
import { DataObj } from './editor/retrieveOriginalSourceData';
import { defaultTransforms } from './transforms/allTransforms';
import BoxName, { BoxNameProps } from './widgets/BoxName';
import { defaultWidgets } from './widgets/allWidgets';

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
  //
  defaultTransforms,
  defaultWidgets,
  BoxName,
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
  TargetOption,
  //
  TTransformWidget,
  TTransformData,
  TransformRendeProps,
  //
  Widget,
  TData,
  TDataCompiled,
  NewItemProps,
  CompileHelper, // check field names
  ItemRendeProps,
  ItemRendeFinalProps,
  ItemRendeFinalHelper,
  BoxNameProps,
  //
  TName,
  TFontAwesomeIcon,
};
