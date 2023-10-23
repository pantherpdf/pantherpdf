/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import { TextSimpleData, TextSimpleCompiled } from './TextSimple';
import { compileComponentTest } from '../unitTestHelpers';

test('text', async () => {
  const dt: TextSimpleData = {
    type: 'TextSimple',
    formula: '"Hello World: " + data.txt',
    children: [],
  };
  const data = { txt: '123' };
  const p2 = await compileComponentTest(dt, data);
  expect(p2).toBeTruthy();
  expect(p2.type).toBe('TextSimple');
  const p = p2 as TextSimpleCompiled;
  expect(p.data).toBe('Hello World: 123');
});

test('text formula==null should be empty string', async () => {
  const dt: TextSimpleData = {
    type: 'TextSimple',
    formula: 'data.dt',
    children: [],
  };
  const p2 = await compileComponentTest(dt, { dt: null });
  expect(p2.data).toBe('');
});

test('text formula==false should be empty string', async () => {
  const dt: TextSimpleData = {
    type: 'TextSimple',
    formula: 'data.dt',
    children: [],
  };
  const p2 = await compileComponentTest(dt, { dt: false });
  expect(p2.data).toBe('');
});

test('text formula==false should be empty string 2', async () => {
  const dt: TextSimpleData = {
    type: 'TextSimple',
    formula: 'data.dt',
    children: [],
  };
  const p2 = await compileComponentTest(dt, { dt: undefined });
  expect(p2.data).toBe('');
});

test('text formula==0 should be "0"', async () => {
  const dt: TextSimpleData = {
    type: 'TextSimple',
    formula: 'data.dt',
    children: [],
  };
  const p2 = await compileComponentTest(dt, { dt: 0 });
  expect(p2.data).toBe('0');
});
