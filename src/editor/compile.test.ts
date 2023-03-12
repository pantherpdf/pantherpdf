/**
 * @jest-environment node
 */

import compile from './compile';
import type { ReportForceChildren } from './types';
import type { TReport } from '../types';
import type { TextSimpleData, TextSimpleCompiled } from '../widgets/TextSimple';
import { sampleReport } from './sampleReport';

test('text data', async () => {
  const report: ReportForceChildren<TextSimpleData> = {
    ...sampleReport,
    children: [
      { type: 'TextSimple', formula: '"Hello World: "+data.num', children: [] },
    ],
  };

  const obj = { num: 123 };
  const compiled = await compile(report, obj);

  expect(compiled.children.length).toBe(1);
  expect(compiled.children[0].type).toBe('TextSimple');
  const c = compiled.children[0] as TextSimpleCompiled;
  expect(c.data).toBe('Hello World: 123');
});

test('text report', async () => {
  const report: ReportForceChildren<TextSimpleData> = {
    ...sampleReport,
    children: [
      {
        type: 'TextSimple',
        formula: '"Hello World: "+report.children[0].type',
        children: [],
      },
    ],
  };

  const obj = { num: 123 };
  const compiled = await compile(report, obj);

  expect(compiled.children.length).toBe(1);
  expect(compiled.children[0].type).toBe('TextSimple');
  const c = compiled.children[0] as TextSimpleCompiled;
  expect(c.data).toBe('Hello World: TextSimple');
});

test('text', async () => {
  const report: ReportForceChildren<TextSimpleData> = {
    ...sampleReport,
    children: [{ type: 'TextSimple', formula: 'non_EXIStent', children: [] }],
  };

  const obj = { num: 123 };
  await expect(compile(report, obj)).rejects.toThrow();
});

test('fonts used', async () => {
  const report: TReport = {
    ...sampleReport,
    children: [],
  };
  report.properties.font = {
    family: 'Arial',
  };
  const obj = {};
  const compiled = await compile(report, obj);
  expect(compiled.fontsUsed).toStrictEqual([
    { name: 'Arial', weight: 400, italic: false },
  ]);
});
