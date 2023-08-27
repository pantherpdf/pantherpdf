/**
 * @jest-environment node
 */

import { TextSimpleData } from './TextSimple';
import { SetVarData } from '../widgets/SetVar';
import { compileComponentTest } from '../unitTestHelpers';
import { ForceChildren } from '../editor/types';

test('SetVar', async () => {
  const dt: ForceChildren<SetVarData | TextSimpleData> = {
    type: 'SetVar',
    source: 'data.abc.def',
    varName: 'ccc',
    children: [{ type: 'TextSimple', formula: 'ccc', children: [] }],
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
    source: 'abc.def',
    varName: 'ccc',
    children: [{ type: 'TextSimple', formula: 'abc', children: [] }],
  };
  const data = { abc: { def: '123' } };

  await expect(compileComponentTest(dt, data)).rejects.toThrow();
});
