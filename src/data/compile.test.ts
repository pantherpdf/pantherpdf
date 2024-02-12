/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import { ReportForceWidgets, compileTest } from '../unitTestHelpers';
import type { ApiEndpoints, Report } from '../types';
import type { TextSimpleData, TextSimpleCompiled } from '../widgets/TextSimple';
import { sampleReport } from '../editor/sampleReport';
import { defaultWidgets } from '../widgets/allWidgets';
import compile from './compile';

test('text data', async () => {
  const report: ReportForceWidgets<TextSimpleData> = {
    ...sampleReport,
    widgets: [
      {
        type: 'TextSimple',
        value: { formula: '"Hello World: "+data.num' },
        children: [],
      },
    ],
  };

  const obj = { num: 123 };
  const compiled = await compileTest(report, obj);

  expect(compiled.widgets.length).toBe(1);
  expect(compiled.widgets[0].type).toBe('TextSimple');
  const c = compiled.widgets[0] as TextSimpleCompiled;
  expect(c.data).toBe('Hello World: 123');
});

test('text report', async () => {
  const report: ReportForceWidgets<TextSimpleData> = {
    ...sampleReport,
    widgets: [
      {
        type: 'TextSimple',
        value: { formula: '"Hello World: "+report.widgets[0].type' },
        children: [],
      },
    ],
  };

  const obj = { num: 123 };
  const compiled = await compileTest(report, obj);

  expect(compiled.widgets.length).toBe(1);
  expect(compiled.widgets[0].type).toBe('TextSimple');
  const c = compiled.widgets[0] as TextSimpleCompiled;
  expect(c.data).toBe('Hello World: TextSimple');
});

test('text', async () => {
  const report: ReportForceWidgets<TextSimpleData> = {
    ...sampleReport,
    widgets: [
      { type: 'TextSimple', value: { formula: 'non_EXIStent' }, children: [] },
    ],
  };

  const obj = { num: 123 };
  await expect(compileTest(report, obj)).rejects.toThrow();
});

test('fonts used', async () => {
  const report: Report = {
    ...sampleReport,
    widgets: [],
  };
  report.properties.font = {
    family: 'Lato',
  };
  const data = {};
  const api: ApiEndpoints = {};
  const compiled = await compile(report, data, defaultWidgets, api);
  expect(compiled.properties.fontsUsed).toStrictEqual([
    { name: 'Lato', weight: 400, italic: false },
  ]);
});
