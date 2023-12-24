/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import Editor from './editor/Editor';
import type { EditorProps, NavbarProps } from './editor/types';
import type {
  CompileHelper,
  ItemRenderPreviewHelper,
  ItemRenderPreviewProps,
  ItemRenderEditorProps,
  ItemNewProps,
  Widget,
  Item,
  ItemCompiled,
} from './widgets/types';
import type {
  TransformRenderProps,
  Transform,
  TransformItem,
} from './transforms/types';
import generate from './data/generate';
import type { GenerateArgs } from './data/generate';
import { isReport } from './types';
import type {
  Report,
  ApiReportMetaData,
  ApiEndpoints,
  ApiFileMetaData,
  ReportProperties,
  ApiUploadMetaData,
  Paper,
  Name,
  OutputProperties,
  Output,
} from './types';
import { setEditorLanguage } from './translation';
import { SourceData } from './data/fetchSourceData';
import { defaultTransforms } from './transforms/allTransforms';
import BoxName, { BoxNameProps } from './widgets/BoxName';
import { defaultWidgets } from './widgets/allWidgets';
import SectionName from './components/SectionName';

const emptyReport: Report = {
  name: 'My report',
  children: [],
  transforms: [],
  properties: {},
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
  Output,
  OutputProperties,
  SourceData,
  //
  Report,
  ReportProperties,
  //
  ApiEndpoints,
  ApiReportMetaData,
  ApiFileMetaData,
  ApiUploadMetaData,
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
