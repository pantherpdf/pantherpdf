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
import getOriginalSourceData from './editor/getOriginalSourceData';
import type { DataTypes, DataObj } from './editor/getOriginalSourceData';
import Container from './Container';
import globalStyle from './globalStyle.module.css';

const StyleSection = globalStyle.section;
const StyleHForm = globalStyle.hform;
const StyleVForm = globalStyle.vform;

export * from './types';
export * from './editor/generateTarget';
export {
  Container,
  Editor,
  FileDialog,
  compile,
  makeHtml,
  PropertyFontGenCss,
  transformData,
  getOriginalSourceData,
  uploadFile,
  DataTypes,
  DataObj,
  StyleSection,
  StyleHForm,
  StyleVForm,
};
