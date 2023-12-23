/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import { TextSimpleData } from './TextSimple';
import { ConditionCompiled, ConditionData } from '../widgets/Condition';
import { ForceChildren, compileComponentTest } from '../unitTestHelpers';

test('Condition should show children when formula is truthy', async () => {
  const dt: ForceChildren<ConditionData | TextSimpleData> = {
    type: 'Condition',
    formula: '1+1',
    children: [{ type: 'TextSimple', formula: '"hello"', children: [] }],
  };
  const data = { arr: ['1', '2'] };
  const p = (await compileComponentTest(dt, data)) as ConditionCompiled;
  expect(p.children.length).toBe(1);
});

test('Condition should show no childs when empty formula', async () => {
  const dt: ForceChildren<ConditionData | TextSimpleData> = {
    type: 'Condition',
    formula: '',
    children: [{ type: 'TextSimple', formula: '"hello"', children: [] }],
  };
  const data = { arr: ['1', '2'] };
  const p = (await compileComponentTest(dt, data)) as ConditionCompiled;
  expect(p.children.length).toBe(0);
});
