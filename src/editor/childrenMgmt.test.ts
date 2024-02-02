/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import { RepeatData } from '../widgets/Repeat';
import { TextSimpleData } from '../widgets/TextSimple';
import {
  findInList,
  removeFromList,
  insertIntoList,
  updateDestAfterRemove,
  idCmp,
  updateItem,
} from './childrenMgmt';
import { sampleReport } from './sampleReport';
import { ReportForceWidgets } from '../unitTestHelpers';
import type { Report } from '../types';

test('findInList', () => {
  const r: ReportForceWidgets<RepeatData | TextSimpleData> = {
    ...sampleReport,
  };

  expect(() => findInList(r, [])).toThrow();
  expect(() => findInList(r, [0])).toThrow();
  expect(() => findInList(r, [200, 1])).toThrow();

  r.widgets = [
    { type: 'TextSimple', formula: '"Hello World: "+data.num', children: [] },
  ];
  expect(() => findInList(r, [1])).toThrow();
  expect(findInList(r, [0])).toBe(r.widgets[0]);

  r.widgets = [
    {
      type: 'Repeat',
      varName: 'rp',
      source: 'data.arr + ["a","b"]',
      direction: 'rows',
      children: [
        { type: 'TextSimple', formula: 'rp', children: [] },
        { type: 'TextSimple', formula: 'rp', children: [] },
        { type: 'TextSimple', formula: 'rp', children: [] },
      ],
    },
    {
      type: 'Repeat',
      varName: 'rp',
      source: 'data.arr + ["a","b"]',
      direction: 'rows',
      children: [
        { type: 'TextSimple', formula: 'rp', children: [] },
        { type: 'TextSimple', formula: 'rp', children: [] },
        { type: 'TextSimple', formula: 'rp', children: [] },
      ],
    },
  ];
  expect(findInList(r, [1, 2])).toBe(r.widgets[1].children?.[2]);
});

test('removeFromList simple', () => {
  let r: ReportForceWidgets<RepeatData | TextSimpleData>;
  r = { ...sampleReport };

  expect(() => removeFromList(r, [])).toThrow();
  expect(() => removeFromList(r, [0])).toThrow();
  expect(() => removeFromList(r, [200, 0])).toThrow();

  r.widgets = [
    { type: 'TextSimple', formula: '"Hello World: "+data.num', children: [] },
  ];
  expect(() => removeFromList(r, [1])).toThrow();
  r = removeFromList(r, [0]);
  expect(r.widgets.length).toBe(0);
});

test('removeFromList', () => {
  let r: Report;
  r = { ...sampleReport };
  // prettier-ignore
  const t0: TextSimpleData = { type:'TextSimple', formula:'rp0', children:[] };
  // prettier-ignore
  const t1: TextSimpleData = { type:'TextSimple', formula:'rp1', children:[] };
  // prettier-ignore
  const t2: TextSimpleData = { type:'TextSimple', formula:'rp2', children:[] };
  // prettier-ignore
  const t3: TextSimpleData = { type:'TextSimple', formula:'rp3', children:[] };
  // prettier-ignore
  const t4: TextSimpleData = { type:'TextSimple', formula:'rp4', children:[] };
  // prettier-ignore
  const t5: TextSimpleData = { type:'TextSimple', formula:'rp5', children:[] };
  // prettier-ignore
  const c0: RepeatData = { type:'Repeat', varName:'rp', source:'data.arr + ["a","b"]', children:[t0,t1,t2], direction:'rows' }
  // prettier-ignore
  const c1: RepeatData = { type:'Repeat', varName:'rp', source:'data.arr + ["a","b"]', children:[t3,t4,t5], direction:'rows' }
  r.widgets = [c0, c1];
  r = removeFromList(r, [1, 0]);
  expect(r.widgets.length).toBe(2);
  expect(r.widgets[0]).toBe(c0);
  expect(r.widgets[1]).not.toBe(c1); // should make a copy
  expect(r.widgets[1].children?.length).toBe(2);
  expect(r.widgets[1].children?.[0]).toBe(t4);
  expect(r.widgets[1].children?.[1]).toBe(t5);
  r = removeFromList(r, [1]);
  expect(r.widgets.length).toBe(1);
  expect(r.widgets[0]).toBe(c0);
  expect(r.widgets[0].children?.length).toBe(3);
  r = removeFromList(r, [0]);
  expect(r.widgets.length).toBe(0);
});

test('insertIntoList', () => {
  let r: Report;
  let r_old: Report;
  r = { ...sampleReport };
  // prettier-ignore
  const t0: TextSimpleData = { type:'TextSimple', formula:'rp0', children:[] };
  // prettier-ignore
  const t1: TextSimpleData = { type:'TextSimple', formula:'rp1', children:[] };
  // prettier-ignore
  const t2: TextSimpleData = { type:'TextSimple', formula:'rp2', children:[] };
  // prettier-ignore
  const t3: TextSimpleData = { type:'TextSimple', formula:'rp3', children:[] };
  // prettier-ignore
  const t4: TextSimpleData = { type:'TextSimple', formula:'rp4', children:[] };
  // prettier-ignore
  const t5: TextSimpleData = { type:'TextSimple', formula:'rp5', children:[] };
  // prettier-ignore
  const t6: TextSimpleData = { type:'TextSimple', formula:'rp6', children:[] };
  // prettier-ignore
  const c0: RepeatData = { type:'Repeat', varName:'rp', source:'data.arr + ["a","b"]', children:[t0,t1,t2], direction:'rows' };
  // prettier-ignore
  const c1: RepeatData = { type:'Repeat', varName:'rp', source:'data.arr + ["a","b"]', children:[], direction:'rows' };

  expect(() => insertIntoList(r, [], t3)).toThrow();
  r_old = r;
  r = insertIntoList(r, [0], c0);
  expect(r).not.toBe(r_old);
  expect(r.widgets[0]).toBe(c0);
  r_old = r;
  let children_old = r.widgets;
  r = insertIntoList(r, [0], c1);
  expect(r.widgets[0]).toBe(c1);
  expect(r.widgets[1]).toBe(c0);
  expect(r.widgets).not.toBe(children_old);

  expect(() => insertIntoList(r, [0, 200], t3)).toThrow();
  expect(() => insertIntoList(r, [2, 0], t3)).toThrow();

  children_old = r.widgets[0].children || [];
  expect(r.widgets[0].children).toBe(children_old);
  expect(() => insertIntoList(r, [0, 1], t3)).toThrow();

  r = insertIntoList(r, [0, 0], t3);
  expect(r.widgets[0].children).not.toBe(children_old);
  expect(r.widgets[0].children?.length).toBe(1);
  expect(r.widgets[0].children?.[0]).toBe(t3);

  r = insertIntoList(r, [0, 0], t4);
  expect(r.widgets[0].children?.length).toBe(2);
  expect(r.widgets[0].children?.[0]).toBe(t4);
  expect(r.widgets[0].children?.[1]).toBe(t3);

  r = insertIntoList(r, [0, 2], t5);
  expect(r.widgets[0].children?.length).toBe(3);
  expect(r.widgets[0].children?.[0]).toBe(t4);
  expect(r.widgets[0].children?.[1]).toBe(t3);
  expect(r.widgets[0].children?.[2]).toBe(t5);

  r = insertIntoList(r, [0, 2], t6);
  expect(r.widgets[0].children?.length).toBe(4);
  expect(r.widgets[0].children?.[0]).toBe(t4);
  expect(r.widgets[0].children?.[1]).toBe(t3);
  expect(r.widgets[0].children?.[2]).toBe(t6);
  expect(r.widgets[0].children?.[3]).toBe(t5);
});

test('updateDestAfterRemove', () => {
  const d2 = updateDestAfterRemove([1, 2, 3, 4], [1, 2, 3, 6]);
  expect(d2).toStrictEqual([1, 2, 3, 4]);
});

test('updateDestAfterRemove up->bottom', () => {
  const d2 = updateDestAfterRemove([1, 2, 3, 4], [1, 0, 3, 3]);
  expect(d2).toStrictEqual([1, 2, 3, 4]);
});

test('updateDestAfterRemove self', () => {
  const d2 = updateDestAfterRemove([1, 2, 3, 4], [1, 2, 3, 4]);
  expect(d2).toStrictEqual([1, 2, 3, 4]);
});

test('updateDestAfterRemove bottom->up', () => {
  const d2 = updateDestAfterRemove([1, 2, 3, 4], [1, 2, 4, 0]);
  expect(d2).toStrictEqual([1, 2, 3, 4]);
});

test('updateDestAfterRemove bottom->up 2', () => {
  const d2 = updateDestAfterRemove([1, 2, 3, 4], [1, 2, 4, 5, 6]);
  expect(d2).toStrictEqual([1, 2, 3, 4]);
});

test('updateDestAfterRemove 2', () => {
  const d2 = updateDestAfterRemove([1, 2, 3, 4], [1, 2, 2]);
  expect(d2).toStrictEqual([1, 2, 2, 4]);
});

test('updateDestAfterRemove parent', () => {
  const d1 = [1, 2, 3, 4];
  expect(() => updateDestAfterRemove(d1, [1, 2])).toThrow();
});

test('updateDestAfterRemove bad ids', () => {
  expect(() => updateDestAfterRemove([], [1, 2])).toThrow();
  expect(() => updateDestAfterRemove([1, 2], [])).toThrow();
});

test('updateDestAfterRemove 3', () => {
  const d2 = updateDestAfterRemove([0, 0, 1], [0, 1]);
  expect(d2).toStrictEqual([0, 0, 1]);
});

test('updateDestAfterRemove 4', () => {
  const d2 = updateDestAfterRemove([0], [0, 1]);
  expect(d2).toStrictEqual([0]);
});

test('idCmp', () => {
  expect(idCmp([1, 1], [1, 1])).toBe(true);
  expect(idCmp([1, 1], [1, 2])).toBe(false);
  expect(idCmp([1, 1], [1])).toBe(false);
});

test('updateItem', () => {
  const r: Report = { ...sampleReport };
  // prettier-ignore
  const t0: TextSimpleData = { type: 'TextSimple', formula: 'rp0', children: [] };
  // prettier-ignore
  const t1: TextSimpleData = { type: 'TextSimple', formula: 'rp1', children: [] };
  // prettier-ignore
  const t2: TextSimpleData = { type: 'TextSimple', formula: 'rp2', children: [] };
  // prettier-ignore
  const t3: TextSimpleData = { type: 'TextSimple', formula: 'rp3', children: [] };
  // prettier-ignore
  const t4: TextSimpleData = { type: 'TextSimple', formula: 'rp4', children: [] };
  // prettier-ignore
  const t5: TextSimpleData = { type: 'TextSimple', formula: 'rp5', children: [] };
  // prettier-ignore
  const c0: RepeatData = { type: 'Repeat', varName: 'rp', source: 'data.arr + ["a","b"]', children: [t0,t1,t2], direction: 'rows' };
  // prettier-ignore
  const c1: RepeatData = { type: 'Repeat', varName: 'rp', source: 'data.arr + ["a","b"]', children: [t3,t4,t5], direction: 'rows' };
  r.widgets = [c0, c1];

  expect(findInList(r, [1, 1])).toBe(t4);
  const t4_2 = { ...t4 };
  const r2 = updateItem(r, [1, 1], t4_2);
  expect(findInList(r, [1, 1])).toBe(t4);
  expect(findInList(r2, [1, 1])).not.toBe(t4);
  expect(findInList(r2, [1, 1])).toBe(t4_2);
  expect(findInList(r2, [1])).not.toBe(findInList(r, [1]));
  expect(r2).toStrictEqual(r);

  expect(() => updateItem(r, [100, 1], t5)).toThrow();
});
