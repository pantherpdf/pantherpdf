/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { TextSimpleData } from './TextSimple';
import { SetVarData } from '../widgets/SetVar';
import { ForceChildren, compileComponentTest } from '../unitTestHelpers';

test('SetVar', async () => {
  const dt: ForceChildren<SetVarData | TextSimpleData> = {
    type: 'SetVar',
    source: { formula: 'data.abc.def' },
    varName: 'ccc',
    children: [{ type: 'TextSimple', value: { formula: 'ccc' }, children: [] }],
  };
  const data = { abc: { def: '123' } };
  const p = await compileComponentTest(dt, data);
  const children = p.children as any;
  expect(children.length).toBe(1);
  expect(children[0].data).toBe('123');
});

test('SetVar check that childs of data are not accessible', async () => {
  const dt: ForceChildren<SetVarData | TextSimpleData> = {
    type: 'SetVar',
    source: { formula: 'abc.def' },
    varName: 'ccc',
    children: [{ type: 'TextSimple', value: { formula: 'abc' }, children: [] }],
  };
  const data = { abc: { def: '123' } };

  await expect(compileComponentTest(dt, data)).rejects.toThrow();
});
