/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import type { Report } from '../types';
import { RepeatData } from '../widgets/Repeat';
import { TextSimpleData } from '../widgets/TextSimple';
import { dropImpl } from './Editor';
import { sampleReport } from './sampleReport';
import type { TDragObj } from './types';

test('dropImpl copy existing widget to the end of doc', () => {
  const r = JSON.parse(JSON.stringify(sampleReport)) as Report;
  const c2: TextSimpleData = {
    type: 'TextSimple',
    children: [],
    value: { formula: '' },
  };
  const c1: RepeatData = {
    type: 'Repeat',
    children: [c2],
    source: { formula: '' },
    varName: '',
    direction: 'rows',
  };
  r.widgets = [c1];
  const dObj: TDragObj = { type: 'wid', wid: [0, 0] };
  const report2 = dropImpl(r, dObj, [1], true);
  expect(report2?.widgets.length).toBe(2);
  expect(report2?.widgets[0].type).toBe('Repeat');
  expect(report2?.widgets[0].children[0].type).toBe('TextSimple');
  expect(report2?.widgets[1].type).toBe('TextSimple');
  expect(report2?.widgets[1]).not.toBe(report2?.widgets[0].children[0]);
});

test('dropImpl move existing widget to the end of doc', () => {
  const r = JSON.parse(JSON.stringify(sampleReport)) as Report;
  const c2: TextSimpleData = {
    type: 'TextSimple',
    children: [],
    value: { formula: '' },
  };
  const c1: RepeatData = {
    type: 'Repeat',
    children: [c2],
    source: { formula: '' },
    varName: '',
    direction: 'rows',
  };
  r.widgets = [c1];
  const dObj: TDragObj = { type: 'wid', wid: [0, 0] };
  const report2 = dropImpl(r, dObj, [1], false);
  expect(report2?.widgets.length).toBe(2);
  expect(report2?.widgets[0].type).toBe('Repeat');
  expect(report2?.widgets[0].children.length).toBe(0);
  expect(report2?.widgets[1].type).toBe('TextSimple');
});

test('dropImpl should throw when empty dest wid', () => {
  const r = JSON.parse(JSON.stringify(sampleReport));
  const dObj: TDragObj = { type: 'wid', wid: [0] };
  expect(() => dropImpl(r, dObj, [], false)).toThrow();
});
