// Parcel processes each file individually,
// so we need to explicitly reference .d.ts files
/// <reference types="./global" />
/// <reference types="./react-style-object-to-css" />

import FileDialog, { uploadFile } from './FileDialog';
import Editor from './editor/Editor';
import compile from './editor/compile';
import makeHtml from './editor/makeHtml';
import { PropertyFontGenCss } from './widgets/PropertyFont';
import { transformData } from './editor/DataTransform';
import retrieveOriginalSourceData from './editor/retrieveOriginalSourceData';
import type { DataTypes, DataObj } from './editor/retrieveOriginalSourceData';
import globalStyle from './globalStyle.module.css';
import type { EditorProps } from './editor/types';

const StyleSection = globalStyle.section;
const StyleHForm = globalStyle.hform;
const StyleVForm = globalStyle.vform;

export * from './types';
export * from './editor/generateTarget';
export * from './translation';
export {
  Editor,
  EditorProps,
  FileDialog,
  compile,
  makeHtml,
  PropertyFontGenCss,
  transformData,
  retrieveOriginalSourceData,
  uploadFile,
  DataTypes,
  DataObj,
  StyleSection,
  StyleHForm,
  StyleVForm,
};
