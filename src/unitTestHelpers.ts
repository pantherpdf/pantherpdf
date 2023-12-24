/**
 * @file Helper functions used in unit tests
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import React from 'react';
import type { Report, ReportCompiled } from './types';
import { defaultWidgets } from './widgets/allWidgets';
import compile from './data/compile';
import { renderBody } from './data/renderToHtml';
import { sampleReport } from './editor/sampleReport';
import { renderToString } from 'react-dom/server';
import type { Item, ItemCompiled } from './widgets/types';

export async function compileComponentTest(
  cmpData: object,
  data: unknown,
): Promise<ItemCompiled> {
  const dt: Report = {
    name: 'John Johnny',
    children: [cmpData as Item],
    transforms: [],
    properties: {},
    variables: [],
  };
  const reportCompiled = await compile(dt, data, defaultWidgets, {});
  return reportCompiled.children[0];
}

export async function compileTest(
  report: Report,
  data: unknown,
): Promise<ReportCompiled> {
  return compile(report, data, defaultWidgets, {});
}

export async function renderWidget(
  item: Item,
  data: unknown = {},
): Promise<string> {
  const report: Report = {
    ...sampleReport,
    children: [item],
  };
  const compiled = await compileTest(report, data);
  const html = renderBody(compiled, defaultWidgets);
  const html2 = React.createElement(React.Fragment, {}, ...html.props.children);
  return renderToString(html2);
}

// to force specific children type
export type ForceChildren<T> =
  | T
  | { [key: string]: unknown; children: ForceChildren<T>[] };

export type ReportForceChildren<T> = Report & { children: ForceChildren<T>[] };
