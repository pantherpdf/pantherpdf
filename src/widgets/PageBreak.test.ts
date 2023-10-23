/**
 * @jest-environment jsdom
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import { PageBreak, PageBreakData } from './PageBreak';
import { compileTest, renderToHtmlContentTest } from '../unitTestHelpers';
import { sampleReport } from '../editor/sampleReport';
import type { Report } from '../types';
import type { ItemNewProps } from '../editor/types';

test('PageBreak should include css page-break-before', async () => {
  const helper: ItemNewProps = { report: sampleReport };
  const el = (await PageBreak.newItem(helper)) as PageBreakData;
  const report: Report = {
    ...sampleReport,
    children: [el],
  };
  const compiled = await compileTest(report, {});
  const html = renderToHtmlContentTest(compiled);
  expect(html.replace(/\s/g, '')).toContain('page-break-before:always');
});
