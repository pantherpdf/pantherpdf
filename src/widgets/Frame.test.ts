/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import { Frame, FrameData } from './Frame';
import { sampleReport } from '../editor/sampleReport';
import type { Report } from '../types';
import { compileTest, renderWidget } from '../unitTestHelpers';
import type { ItemNewProps } from './types';
import { TextSimple, TextSimpleData } from './TextSimple';

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
  const html = await renderWidget(el);
  expect(html.replace(/\s/g, '')).toContain('page-break-inside:avoid');
});

test('Frame should not add whitespace around outer div', async () => {
  const helper: ItemNewProps = { report: sampleReport };
  const elOuter = (await Frame.newItem(helper)) as FrameData;
  const elInner = (await Frame.newItem(helper)) as FrameData;
  const elTxt = (await TextSimple.newItem(helper)) as TextSimpleData;
  elTxt.formula = '"abc"';
  elInner.children.push(elTxt);
  elOuter.children.push(elInner);
  const html = await renderWidget(elOuter);
  expect(html).not.toContain(' <');
  expect(html).not.toContain('\n<');
  expect(html).not.toContain('\t<');
});
