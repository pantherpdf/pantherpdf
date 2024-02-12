/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023-2024
 * @license MIT
 */

import Editor from './editor/Editor';
import type { EditorProps, NavbarProps } from './editor/types';
import type {
  CompileHelper,
  WidgetPreviewProps,
  WidgetEditorProps,
  WidgetNewProps,
  Widget,
  WidgetItem,
  WidgetCompiled,
} from './widgets/types';
import type {
  TransformEditorProps,
  Transform,
  TransformItem,
  TransformHelper,
} from './transforms/types';
import generate, { generateData } from './data/generate';
import type { GenerateArgs } from './data/generate';
import isReport from './data/isReport';
import type {
  Report,
  ApiReportMetaData,
  ApiEndpoints,
  ApiFileMetaData,
  ReportProperties,
  ApiUploadMetaData,
  Paper,
  GenerateResultProperties,
  GenerateResult,
  FormulaObject,
  ReportPropertiesCompiled,
} from './types';
import {
  setEditorLanguage,
  getEditorLanguage,
  transName,
  TransName,
} from './translation';
import { SourceData } from './data/fetchSourceData';
import { defaultTransforms } from './transforms/allTransforms';
import WidgetEditorName from './widgets/WidgetEditorName';
import { defaultWidgets } from './widgets/allWidgets';
import SectionName from './components/SectionName';
import InputApplyOnEnter from './components/InputApplyOnEnter';
import { FontStyle } from './widgets/PropertyFont';

const emptyReport: Report = {
  widgets: [],
  transforms: [],
  properties: {},
  variables: [],
};

export {
  // Frontend: React component
  Editor,
  // Backend
  generate,
  generateData,
  // Other
  isReport,
  setEditorLanguage,
  getEditorLanguage,
  transName,
  //
  defaultTransforms,
  defaultWidgets,
  WidgetEditorName,
  //
  emptyReport,
  //
  SectionName,
  InputApplyOnEnter,
};

export type {
  EditorProps,
  NavbarProps,
  Paper,
  GenerateArgs,
  GenerateResult,
  GenerateResultProperties,
  SourceData,
  FormulaObject,
  //
  Report,
  ReportProperties,
  //
  ApiEndpoints,
  ApiReportMetaData,
  ApiFileMetaData,
  ApiUploadMetaData,
  FontStyle,
  //
  Transform,
  TransformItem,
  TransformEditorProps,
  TransformHelper,
  //
  Widget,
  WidgetItem,
  WidgetCompiled,
  CompileHelper,
  WidgetNewProps,
  WidgetEditorProps,
  WidgetPreviewProps,
  ReportPropertiesCompiled,
  //
  TransName,
};
