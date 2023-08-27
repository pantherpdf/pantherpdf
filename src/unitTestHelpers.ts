/** Helpers used for unit tests */

import { TData, TDataCompiled, TReport, TReportCompiled } from './types';
import { defaultWidgets } from './widgets/allWidgets';
import compile from './editor/compile';
import { renderToHtmlContent } from './editor/renderToHtml';

export async function compileComponentTest(
  cmpData: object,
  data: unknown,
): Promise<TDataCompiled> {
  const dt: TReport = {
    _id: '',
    target: 'pdf',
    version: '1.0.0',
    name: 'John Johnny',
    email: 'admin@admin.com',
    time: '2020-01-01T01:01:01Z',
    children: [cmpData as TData],
    transforms: [],
    properties: {},
    dataUrl: '',
    variables: [],
  };
  const reportCompiled = await compile(dt, data, defaultWidgets, {});
  return reportCompiled.children[0];
}

export async function compileTest(
  report: TReport,
  data: unknown,
): Promise<TReportCompiled> {
  return compile(report, data, defaultWidgets, {});
}

export function renderToHtmlContentTest(report: TReportCompiled) {
  return renderToHtmlContent(report, defaultWidgets);
}
