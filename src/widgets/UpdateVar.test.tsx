/**
 * @jest-environment node
 */

import { TextSimpleData } from './TextSimple';
import { SetVarData } from '../widgets/SetVar';
import { UpdateVarData } from '../widgets/UpdateVar';
import compile, { compileComponent } from '../editor/compile';
import { ForceChildren } from '../editor/types';
import { RepeatData } from './Repeat';
import { sampleReport } from '../editor/sampleReport';
import { TReport } from '../types';

test('UpdateVar SetVar', async () => {
  const dt: ForceChildren<
    SetVarData | TextSimpleData | RepeatData | UpdateVarData
  > = {
    type: 'SetVar',
    source: '1',
    varName: 'ccc',
    children: [
      { type: 'TextSimple', formula: 'ccc', children: [] },
      {
        type: 'Repeat',
        source: '[1,2,3,4,5]',
        varName: 'item',
        children: [
          {
            type: 'UpdateVar',
            varName: 'ccc',
            formula: 'ccc + 1',
            children: [],
          },
        ],
      },
      { type: 'TextSimple', formula: 'ccc', children: [] },
    ],
  };
  const p = await compileComponent(dt, {});
  const children = p.children as any;
  expect(children[0].data).toBe('1');
  expect(children[2].data).toBe('6');
});

test('UpdateVar reportVar', async () => {
  const report = JSON.parse(JSON.stringify(sampleReport)) as TReport;
  report.children = [
    { type: 'TextSimple', formula: 'ccc', children: [] },
    {
      type: 'Repeat',
      source: '[1,2,3,4,5]',
      varName: 'item',
      children: [
        { type: 'UpdateVar', varName: 'ccc', formula: 'ccc * 3', children: [] },
      ],
    },
    { type: 'TextSimple', formula: 'ccc', children: [] },
  ];
  report.variables.push({ name: 'ccc', formula: '5' });
  const p = await compile(report, {});
  expect(p.children[0].data).toBe('5');
  expect(p.children[2].data).toBe('1215');
});
