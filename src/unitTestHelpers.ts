/**
 * @file Helper functions used in unit tests
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023-2024
 * @license MIT
 */

import React from 'react';
import type { Report, ReportCompiled } from './types';
import { defaultWidgets } from './widgets/allWidgets';
import compile from './data/compile';
import { renderBody } from './data/renderToHtml';
import { sampleReport } from './editor/sampleReport';
import { renderToString } from 'react-dom/server';
import type { WidgetItem, WidgetCompiled } from './widgets/types';
import { FontStyle } from './widgets/PropertyFont';

export async function compileComponentTest(
  cmpData: object,
  data: unknown,
): Promise<WidgetCompiled> {
  const dt: Report = {
    widgets: [cmpData as WidgetItem],
    transforms: [],
    properties: {},
    variables: [],
  };
  const reportCompiled = await compile(dt, data, defaultWidgets, {});
  return reportCompiled.widgets[0];
}

export async function compileTest(
  report: Report,
  data: unknown,
): Promise<ReportCompiled> {
  return compile(report, data, defaultWidgets, {});
}

export async function renderWidget(
  item: WidgetItem,
  data: unknown = {},
): Promise<string> {
  const report: Report = {
    ...sampleReport,
    widgets: [item],
  };
  const compiled = await compileTest(report, data);
  const html = renderBody(compiled, defaultWidgets);
  const html2 = React.createElement(React.Fragment, {}, ...html.props.children);
  return renderToString(html2);
}

// to force specific children type
export type ForceChildren<T> = T & { children: ForceChildren<T>[] };

export type ReportForceWidgets<T> = Report & { widgets: ForceChildren<T>[] };

export function sampleFontServiceCssUrl(f: FontStyle): string {
  return `https://my-font-service.com/css?family=${encodeURIComponent(f.name)}:ital,wght@${f.italic ? 1 : 0},${encodeURIComponent(f.weight)}&display=swap`;
}
