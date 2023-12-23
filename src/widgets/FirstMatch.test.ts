/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import { TextSimpleData } from './TextSimple';
import { FirstMatchCompiled, FirstMatchData } from '../widgets/FirstMatch';
import { ForceChildren, compileComponentTest } from '../unitTestHelpers';

test('FirstMatch', async () => {
  const dt: ForceChildren<FirstMatchData | TextSimpleData> = {
    type: 'FirstMatch',
    source: '[1,2,3,4,5,6]',
    condition: 'match22 > 3',
    varName: 'match22',
    children: [
      { type: 'TextSimple', formula: '"hello " + match22', children: [] },
    ],
  };
  const data = {};
  const p = (await compileComponentTest(dt, data)) as FirstMatchCompiled;
  expect(p.children.length).toBe(1);
  expect(p.children[0].data).toBe('hello 4');
});
