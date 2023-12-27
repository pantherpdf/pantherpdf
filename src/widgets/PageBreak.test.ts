/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import { PageBreak, PageBreakData } from './PageBreak';
import { renderWidget } from '../unitTestHelpers';
import { sampleReport } from '../editor/sampleReport';
import type { WidgetNewProps } from './types';

test('PageBreak should include css page-break-before', async () => {
  const helper: WidgetNewProps = { report: sampleReport };
  const el = (await PageBreak.newItem(helper)) as PageBreakData;
  const html = await renderWidget(el);
  expect(html.replace(/\s/g, '')).toContain('page-break-before:always');
});
