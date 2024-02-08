/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023-2024
 * @license MIT
 */

import generate from './generate';
import type { ApiEndpoints, Report } from '../types';
import { sampleReport } from '../editor/sampleReport';

test('generate pdf', async () => {
  const report: Report = JSON.parse(JSON.stringify(sampleReport));
  report.properties.fileName = { formula: 'data[1].abc + ".pdf"' };

  const data = [
    { abc: 'a', def: 'b' },
    { abc: 'č', def: '€' },
  ];
  const api: ApiEndpoints = {};
  const result = await generate({
    report,
    api,
    data: { value: data, type: 'as-is' },
  });
  expect(result.properties.fileName).toBe('č.pdf');
});
