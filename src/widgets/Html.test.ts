/**
 * @jest-environment node
 */

import { HtmlData, HtmlCompiled } from './Html';
import {
  compileComponentTest,
  compileTest,
  renderToHtmlContentTest,
} from '../unitTestHelpers';
import { sampleReport } from '../editor/sampleReport';
import { ReportForceChildren } from '../editor/types';

test('Html compile', async () => {
  const dt: HtmlData = { type: 'Html', source: 'data.desc', children: [] };

  const data = { desc: '<p>Hello</p>' };
  const p2 = await compileComponentTest(dt, data);
  expect(p2).toBeTruthy();
  expect(p2.type).toBe('Html');
  const p = p2 as HtmlCompiled;
  expect(p.data).toBe('<p>Hello</p>');
});

test('html render', async () => {
  const report: ReportForceChildren<HtmlData> = {
    ...sampleReport,
    children: [{ type: 'Html', source: 'data.desc', children: [] }],
  };

  const data = { desc: '<p>Hello</p>' };
  const compiled = await compileTest(report, data);
  const html = renderToHtmlContentTest(compiled);
  expect(html).toMatchSnapshot();
});

test('Html source==null should be empty string', async () => {
  const dt: HtmlData = { type: 'Html', source: 'data.dt', children: [] };
  const p2 = await compileComponentTest(dt, { dt: null });
  expect(p2.data).toBe('');
});

test('Html source==false should be empty string', async () => {
  const dt: HtmlData = { type: 'Html', source: 'data.dt', children: [] };
  const p2 = await compileComponentTest(dt, { dt: false });
  expect(p2.data).toBe('');
});

test('Html source==undefined should be empty string', async () => {
  const dt: HtmlData = { type: 'Html', source: 'data.dt', children: [] };
  const p2 = await compileComponentTest(dt, { dt: undefined });
  expect(p2.data).toBe('');
});

test('Html source==0 should be "0"', async () => {
  const dt: HtmlData = { type: 'Html', source: 'data.dt', children: [] };
  const p2 = await compileComponentTest(dt, { dt: 0 });
  expect(p2.data).toBe('0');
});
