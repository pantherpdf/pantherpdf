/**
 * @file Helper functions used in unit tests
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import React from 'react';
import { Item, ItemCompiled, Report, ReportCompiled } from './types';
import { defaultWidgets } from './widgets/allWidgets';
import compile from './editor/compile';
import { renderBody } from './editor/renderToHtml';
import { sampleReport } from './editor/sampleReport';
import renderReactNodeToHtmlString from './htmlRenderer/htmlRenderer';

export async function compileComponentTest(
  cmpData: object,
  data: unknown,
): Promise<ItemCompiled> {
  const dt: Report = {
    target: 'pdf',
    name: 'John Johnny',
    children: [cmpData as Item],
    transforms: [],
    properties: {},
    dataUrl: '',
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
  return renderReactNodeToHtmlString(html2);
}
