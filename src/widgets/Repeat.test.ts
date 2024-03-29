/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { TextSimpleData } from './TextSimple';
import { RepeatData } from './Repeat';
import {
  ForceChildren,
  compileComponentTest,
  compileTest,
  renderWidget,
} from '../unitTestHelpers';
import { sampleReport } from '../editor/sampleReport';
import type { Report } from '../types';
import { TextHtmlData } from './TextHtml/TextHtml';
import { FrameData } from './Frame';
import { valueInternalFromEditor } from './TextHtml/internalRepresentation';

test('text', async () => {
  const dt: ForceChildren<RepeatData | TextSimpleData> = {
    type: 'Repeat',
    varName: 'rp',
    source: { formula: 'data.arr + ["a","b"]' },
    direction: 'rows',
    children: [{ type: 'TextSimple', value: { formula: 'rp' }, children: [] }],
  };
  const data = { arr: ['1', '2'] };
  const p = (await compileComponentTest(dt, data)) as any;
  expect(p).toBeTruthy();
  expect(p.type).toBe('Repeat');
  expect(p.children[0][0].data).toBe('1');
  expect(p.children[1][0].data).toBe('2');
  expect(p.children[2][0].data).toBe('a');
  expect(p.children[3][0].data).toBe('b');
});

test('complete rows', async () => {
  const txt: TextHtmlData = {
    type: 'TextHtml',
    value: valueInternalFromEditor('<data>item</data>'),
    font: {},
    children: [],
  };
  const rpt: RepeatData = {
    type: 'Repeat',
    children: [txt],
    source: { formula: '[1,2,3,4,5]' },
    varName: 'item',
    direction: 'rows',
  };
  const report: Report = { ...sampleReport, widgets: [rpt] };
  const report2 = await compileTest(report, {});

  const children = report2.widgets as any;
  expect(children[0].type).toBe('Repeat');
  expect(children[0].children.length).toBe(5);
  expect(Array.isArray(children[0].children[0])).toBeTruthy();
  expect(children[0].children[0][0].type).toBe('TextHtml');
  expect(children[0].children[0][0].value).toBe('1');

  const html = await renderWidget(rpt);
  expect(html).toMatchSnapshot();
});

test('repeat columns', async () => {
  const txt: TextHtmlData = {
    type: 'TextHtml',
    value: valueInternalFromEditor('<data>item</data>'),
    font: {},
    children: [],
  };
  const rpt: RepeatData = {
    type: 'Repeat',
    children: [txt],
    source: { formula: '[1,2,3,4,5,6,7]' },
    varName: 'item',
    direction: 'columns',
  };

  const html = await renderWidget(rpt);
  expect(html).toMatchSnapshot();
});

test('complete grid', async () => {
  const txt: TextHtmlData = {
    type: 'TextHtml',
    value: valueInternalFromEditor('<data>item</data>'),
    font: {},
    children: [],
  };
  const rpt: RepeatData = {
    type: 'Repeat',
    children: [txt],
    source: { formula: '[1,2,3,4,5]' },
    varName: 'item',
    direction: 'grid',
  };
  const report: Report = { ...sampleReport, widgets: [rpt] };
  const report2 = await compileTest(report, {});

  const children = report2.widgets as any;
  expect(children[0].type).toBe('Repeat');
  expect(children[0].children.length).toBe(5);
  expect(Array.isArray(children[0].children[0])).toBeTruthy();
  expect(children[0].children[0][0].type).toBe('TextHtml');
  expect(children[0].children[0][0].value).toBe('1');

  const html = await renderWidget(rpt);
  expect(html).toMatchSnapshot();
});

test('grid - products', async () => {
  const frame: FrameData = {
    type: 'Frame',
    children: [],
    margin: [0, 0, 0, 0],
    padding: [0, 0, 0, 0],
    border: {
      width: 0,
      color: '#000000',
      style: 'solid',
    },
    width: '5cm',
    height: '5cm',
    font: {},
  };
  const rpt: RepeatData = {
    type: 'Repeat',
    children: [frame],
    source: { formula: '[1,2,3]' },
    varName: 'item',
    direction: 'grid',
  };

  const html = await renderWidget(rpt);
  expect(html).toMatchSnapshot();

  const report: Report = { ...sampleReport, widgets: [rpt] };
  const report2 = await compileTest(report, {});
  expect(report2.properties.globalCss.replace(/\s/g, '')).toContain(
    '.grid-with-frame>div{display:inline-block;vertical-align:top;}',
  );
});
