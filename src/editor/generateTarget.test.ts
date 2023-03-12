/**
 * @jest-environment node
 */

import { generateTarget } from './generateTarget';
import { ApiEndpoints, TReport } from '../types';
import { sampleReport } from './sampleReport';
import { CSV, CSVData } from '../transforms/CSV';

test('generateTarget CSV CP1250', async () => {
  const transCsv = (await CSV.newItem()) as CSVData;
  transCsv.rows = [
    {
      source: 'data',
      cols: ['item.abc', 'item.def'],
    },
  ];

  const report: TReport = JSON.parse(JSON.stringify(sampleReport));
  report.target = 'csv-windows-1250';
  report.transforms.push(transCsv);
  report.properties.fileName = '"abc.def"';

  const data = [
    { abc: 'a', def: 'b' },
    { abc: 'č', def: '€' },
  ];
  const api: ApiEndpoints = {};
  const result = await generateTarget({
    report,
    api,
    data: { value: data, type: 'as-is' },
    makePdf: () => {
      throw new Error('not supported');
    },
  });
  expect(result.filename).toBe('abc.def');
  expect(result.contentType).toBe('text/csv; charset=windows-1250');
  const b64 = Buffer.from(result.body).toString('base64');
  expect(b64).toBe('ImEiOyJiIg0KIugiOyKAIg0K');
});

test('generateTarget CSV newlines', async () => {
  const transCsv = (await CSV.newItem()) as CSVData;
  transCsv.rows = [
    {
      source: 'data',
      cols: ['item.abc', 'item.def'],
    },
  ];

  const report: TReport = JSON.parse(JSON.stringify(sampleReport));
  report.target = 'csv-utf-8';
  report.transforms.push(transCsv);
  report.properties.fileName = '"abc.def"';

  const data = [
    { abc: '"', def: '1\n2' },
    { abc: 'č', def: "';'" },
  ];
  const api: ApiEndpoints = {};
  const result = await generateTarget({
    report,
    api,
    data: { value: data, type: 'as-is' },
    makePdf: () => {
      throw new Error('not supported');
    },
  });
  expect(result.filename).toBe('abc.def');
  expect(result.contentType).toBe('text/csv; charset=utf-8');
  const b64 = Buffer.from(result.body).toString('base64');
  expect(b64).toBe('IiIiIjsiMQoyIgoixI0iOyInOyciCg==');
});

test('generateTarget override', async () => {
  const transCsv = (await CSV.newItem()) as CSVData;
  transCsv.rows = [
    {
      source: 'data',
      cols: ['item.abc', 'item.def'],
    },
  ];

  const report: TReport = JSON.parse(JSON.stringify(sampleReport));
  report.target = 'csv-utf-8';
  report.transforms.push(transCsv);
  report.properties.fileName = '"abc.csv"';

  const data = [
    { abc: '1', def: '2' },
    { abc: '3', def: '4' },
  ];
  const api: ApiEndpoints = {};
  const result = await generateTarget({
    report,
    api,
    data: { value: data, type: 'as-is' },
    targetOverride: 'json',
    makePdf: () => {
      throw new Error('not supported');
    },
  });
  expect(result.filename).toBe('abc.json');
  expect(result.contentType).toBe('application/json');
  const txt = new TextDecoder().decode(result.body);
  expect(JSON.parse(txt)).toEqual([
    ['1', '2'],
    ['3', '4'],
  ]);
});
