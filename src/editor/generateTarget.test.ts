/**
 * @jest-environment node
 */

import generateTarget from './generateTarget';
import { ApiEndpoints, TReport, TReportProperties } from '../types';
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
  });
  expect(result.filename).toBe('abc.json');
  expect(result.contentType).toBe('application/json');
  expect(typeof result.body).toBe('string');
  expect(JSON.parse(result.body as string)).toEqual([
    ['1', '2'],
    ['3', '4'],
  ]);
});

test('generateTarget pdf', async () => {
  const report: TReport = JSON.parse(JSON.stringify(sampleReport));
  report.properties.fileName = 'data[1].abc + ".pdf"';

  const data = [
    { abc: 'a', def: 'b' },
    { abc: 'č', def: '€' },
  ];
  const api: ApiEndpoints = {
    generatePdf: async (html: string, properties: TReportProperties) => {
      return new Uint8Array([1, 2, 3, 4]);
    },
  };
  const result = await generateTarget({
    report,
    api,
    data: { value: data, type: 'as-is' },
  });
  expect(result.filename).toBe('č.pdf');
  expect(result.body).toBeInstanceOf(Uint8Array);
  expect(result.body.length).toBe(4);
  expect(result.body[0]).toBe(1);
  expect(result.body[1]).toBe(2);
  expect(result.body[2]).toBe(3);
  expect(result.body[3]).toBe(4);
  expect(result.contentType).toBe('application/pdf');
});
