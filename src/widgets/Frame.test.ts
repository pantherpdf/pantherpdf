/**
 * @jest-environment jsdom
 */

import { Frame, FrameData } from './Frame';
import { sampleReport } from '../editor/sampleReport';
import type { Report } from '../types';
import { compileTest, renderToHtmlContentTest } from '../unitTestHelpers';
import type { ItemNewProps } from '../editor/types';

test('Frame should include google font', async () => {
  const helper: ItemNewProps = { report: sampleReport };
  const el = (await Frame.newItem(helper)) as FrameData;
  el.font.family = 'Lato';
  el.font.weight = 'bold';
  el.font.style = 'italic';
  const report: Report = {
    ...sampleReport,
    children: [el],
  };
  const compiled = await compileTest(report, {});
  expect(compiled.fontsUsed).toStrictEqual([
    { name: 'Lato', weight: 700, italic: true },
  ]);
});

test('Frame should include page break property', async () => {
  const helper: ItemNewProps = { report: sampleReport };
  const el = (await Frame.newItem(helper)) as FrameData;
  el.pageBreakAvoid = true;
  const report: Report = {
    ...sampleReport,
    children: [el],
  };
  const compiled = await compileTest(report, {});
  const html = renderToHtmlContentTest(compiled);
  expect(html.replace(/\s/g, '')).toContain('page-break-inside:avoid');
});

test('Frame should not add whitespace around outer div', async () => {
  const helper: ItemNewProps = { report: sampleReport };
  const el = (await Frame.newItem(helper)) as FrameData;
  const report: Report = {
    ...sampleReport,
    children: [el],
  };
  const compiled = await compileTest(report, {});
  const html = renderToHtmlContentTest(compiled);
  expect(html.trim()).toBe(html);
});
