/** Helpers used for unit tests */

import { Item, ItemCompiled, Report, ReportCompiled } from './types';
import { defaultWidgets } from './widgets/allWidgets';
import compile from './editor/compile';
import { renderToHtmlContent } from './editor/renderToHtml';

export async function compileComponentTest(
  cmpData: object,
  data: unknown,
): Promise<ItemCompiled> {
  const dt: Report = {
    _id: '',
    target: 'pdf',
    version: '1.0.0',
    name: 'John Johnny',
    email: 'admin@admin.com',
    time: '2020-01-01T01:01:01Z',
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

export function renderToHtmlContentTest(report: ReportCompiled) {
  return renderToHtmlContent(report, defaultWidgets);
}
