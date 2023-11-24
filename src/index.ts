/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

// Parcel processes each file individually,
// so we need to explicitly reference .d.ts files
/// <reference types="./react-style-object-to-css" />

import Editor from './editor/Editor';
import type {
  CompileHelper,
  EditorProps,
  NavbarProps,
  ItemRenderPreviewHelper,
  ItemRenderPreviewProps,
  ItemRenderEditorProps,
  ItemNewProps,
  Name,
  TransformRenderProps,
  Transform,
  Widget,
} from './editor/types';
import generate from './editor/generate';
import type { GenerateArgs, FileOutput } from './editor/generate';
import { isReport } from './types';
import type {
  Report,
  ApiReportMetaData,
  ApiEndpoints,
  ApiFileMetaData,
  ReportProperties,
  ApiUploadMetaData,
  TargetOption,
  TransformItem,
  Item,
  ItemCompiled,
  Paper,
} from './types';
import { setEditorLanguage } from './translation';
import { SourceData } from './editor/retrieveOriginalSourceData';
import { defaultTransforms } from './transforms/allTransforms';
import BoxName, { BoxNameProps } from './widgets/BoxName';
import { defaultWidgets } from './widgets/allWidgets';
import SectionName from './components/SectionName';

const emptyReport: Report = {
  name: 'My report',
  target: 'pdf',
  children: [],
  transforms: [],
  properties: {},
  dataUrl: '',
  variables: [],
};

export {
  // Frontend: React component
  Editor,
  // Backend
  generate,
  // Other
  isReport,
  setEditorLanguage,
  //
  defaultTransforms,
  defaultWidgets,
  BoxName,
  //
  emptyReport,
  //
  SectionName,
};

export type {
  EditorProps,
  NavbarProps,
  Paper,
  GenerateArgs,
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
  Transform,
  TransformItem,
  TransformRenderProps,
  //
  Widget,
  Item,
  ItemCompiled,
  CompileHelper,
  ItemNewProps,
  ItemRenderEditorProps,
  ItemRenderPreviewProps,
  ItemRenderPreviewHelper,
  BoxNameProps,
  //
  Name,
};
