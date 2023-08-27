/**
 * @jest-environment jsdom
 */

import { PageBreak, PageBreakData } from './PageBreak';
import { compileTest, renderToHtmlContentTest } from '../unitTestHelpers';
import { sampleReport } from '../editor/sampleReport';
import type { TReport } from '../types';
import type { NewItemProps } from '../editor/types';

test('PageBreak should include css page-break-before', async () => {
  const helper: NewItemProps = { report: sampleReport };
  const el = (await PageBreak.newItem(helper)) as PageBreakData;
  const report: TReport = {
    ...sampleReport,
    children: [el],
  };
  const compiled = await compileTest(report, {});
  const html = renderToHtmlContentTest(compiled);
  expect(html.replace(/\s/g, '')).toContain('page-break-before:always');
});
