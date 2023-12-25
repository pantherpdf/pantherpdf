/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import { ReportForceWidgets, compileTest } from '../unitTestHelpers';
import type { Report } from '../types';
import type { TextSimpleData, TextSimpleCompiled } from '../widgets/TextSimple';
import { sampleReport } from '../editor/sampleReport';

test('text data', async () => {
  const report: ReportForceWidgets<TextSimpleData> = {
    ...sampleReport,
    widgets: [
      { type: 'TextSimple', formula: '"Hello World: "+data.num', children: [] },
    ],
  };

  const obj = { num: 123 };
  const compiled = await compileTest(report, obj);

  expect(compiled.children.length).toBe(1);
  expect(compiled.children[0].type).toBe('TextSimple');
  const c = compiled.children[0] as TextSimpleCompiled;
  expect(c.data).toBe('Hello World: 123');
});

test('text report', async () => {
  const report: ReportForceWidgets<TextSimpleData> = {
    ...sampleReport,
    widgets: [
      {
        type: 'TextSimple',
        formula: '"Hello World: "+report.widgets[0].type',
        children: [],
      },
    ],
  };

  const obj = { num: 123 };
  const compiled = await compileTest(report, obj);

  expect(compiled.children.length).toBe(1);
  expect(compiled.children[0].type).toBe('TextSimple');
  const c = compiled.children[0] as TextSimpleCompiled;
  expect(c.data).toBe('Hello World: TextSimple');
});

test('text', async () => {
  const report: ReportForceWidgets<TextSimpleData> = {
    ...sampleReport,
    widgets: [{ type: 'TextSimple', formula: 'non_EXIStent', children: [] }],
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
    family: 'Arial',
  };
  const obj = {};
  const compiled = await compileTest(report, obj);
  expect(compiled.fontsUsed).toStrictEqual([
    { name: 'Arial', weight: 400, italic: false },
  ]);
});
