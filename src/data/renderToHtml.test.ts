/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import {
  compileTest,
  sampleFontServiceCssUrl,
  renderWidget,
} from '../unitTestHelpers';
import type { ApiEndpoints, Report } from '../types';
import type { TextSimpleData } from '../widgets/TextSimple';
import { sampleReport } from '../editor/sampleReport';
import renderToHtml from './renderToHtml';
import { defaultWidgets } from '../widgets/allWidgets';
import compile from './compile';

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

test('should include external font', async () => {
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
  const api: ApiEndpoints = {
    fonts: {
      list: [],
      getCssUrls: arr => arr.map(sampleFontServiceCssUrl),
    },
  };
  const compiled = await compile(report, {}, defaultWidgets, api);
  const html = renderToHtml(compiled, defaultWidgets, api);
  const expectedUrl1 =
    'https://my-font-service.com/css?family=Roboto+Mono:ital,wght@0,400&display=swap';
  const expectedUrl2 =
    'https://my-font-service.com/css?family=Roboto%20Mono:ital,wght@0,400&display=swap';
  expect(
    html.indexOf(expectedUrl1) !== -1 || html.indexOf(expectedUrl2) !== -1,
  ).toBeTruthy();
});

test('should include globalCss', async () => {
  const compiled = await compileTest(sampleReport, {});
  compiled.properties.globalCss = '.abc-def-123-456 { font-weight: bold }';
  const html = renderToHtml(compiled, defaultWidgets, {});
  expect(html.indexOf('.abc-def-123-456 { font-weight: bold }')).not.toBe(-1);
});
