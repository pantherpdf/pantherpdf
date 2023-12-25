/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import { sampleReport } from '../editor/sampleReport';
import isReport from './isReport';

test('isReport should approve sampleReport', async () => {
  expect(isReport(sampleReport)).toBe(true);
});
