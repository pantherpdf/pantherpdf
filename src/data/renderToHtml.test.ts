/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import { compileTest, renderWidget } from '../unitTestHelpers';
import type { Report } from '../types';
import type { TextSimpleData } from '../widgets/TextSimple';
import { sampleReport } from '../editor/sampleReport';
import renderToHtml from './renderToHtml';
import { defaultWidgets } from '../widgets/allWidgets';

test('text', async () => {
  const el: TextSimpleData = {
    type: 'TextSimple',
    value: { formula: '"Hello World: "+data.num' },
    children: [],
  };
  const obj = { num: 123 };
  const html = await renderWidget(el, obj);
  expect(html).toMatchSnapshot();
});

test('should include google font', async () => {
  const report: Report = {
    ...sampleReport,
    widgets: [],
  };
  report.properties = {
    ...report.properties,
    font: {
      family: 'Roboto Mono',
    },
  };
  const compiled = await compileTest(report, {});
  const html = renderToHtml(compiled, defaultWidgets);
  const expectedUrl1 =
    'https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,400&display=swap';
  const expectedUrl2 =
    'https://fonts.googleapis.com/css2?family=Roboto%20Mono:ital,wght@0,400&display=swap';
  expect(
    html.indexOf(expectedUrl1) !== -1 || html.indexOf(expectedUrl2) !== -1,
  ).toBeTruthy();
});

test('should include globalCss', async () => {
  const compiled = await compileTest(sampleReport, {});
  compiled.properties.globalCss = '.abc-def-123-456 { font-weight: bold }';
  const html = renderToHtml(compiled, defaultWidgets);
  expect(html.indexOf('.abc-def-123-456 { font-weight: bold }')).not.toBe(-1);
});
