/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { TextSimpleData } from './TextSimple';
import { SetVarData } from '../widgets/SetVar';
import { UpdateVarData } from '../widgets/UpdateVar';
import {
  ForceChildren,
  compileComponentTest,
  compileTest,
} from '../unitTestHelpers';
import { RepeatData } from './Repeat';
import { sampleReport } from '../editor/sampleReport';
import type { Report } from '../types';

test('UpdateVar SetVar', async () => {
  const dt: ForceChildren<
    SetVarData | TextSimpleData | RepeatData | UpdateVarData
  > = {
    type: 'SetVar',
    source: { formula: '1' },
    varName: 'ccc',
    children: [
      { type: 'TextSimple', value: { formula: 'ccc' }, children: [] },
      {
        type: 'Repeat',
        source: { formula: '[1,2,3,4,5]' },
        varName: 'item',
        direction: 'rows',
        children: [
          {
            type: 'UpdateVar',
            varName: 'ccc',
            value: { formula: 'ccc + 1' },
            children: [],
          },
        ],
      },
      { type: 'TextSimple', value: { formula: 'ccc' }, children: [] },
    ],
  };
  const p = await compileComponentTest(dt, {});
  const children = p.children as any;
  expect(children[0].data).toBe('1');
  expect(children[2].data).toBe('6');
});

test('UpdateVar reportVar', async () => {
  const report = JSON.parse(JSON.stringify(sampleReport)) as Report;
  report.widgets = [
    { type: 'TextSimple', value: { formula: 'ccc' }, children: [] },
    {
      type: 'Repeat',
      source: { formula: '[1,2,3,4,5]' },
      varName: 'item',
      children: [
        {
          type: 'UpdateVar',
          varName: 'ccc',
          value: { formula: 'ccc * 3' },
          children: [],
        },
      ],
    },
    { type: 'TextSimple', value: { formula: 'ccc' }, children: [] },
  ];
  report.variables.push({ name: 'ccc', value: { formula: '5' } });
  const p = await compileTest(report, {});
  expect(p.widgets[0].data).toBe('5');
  expect(p.widgets[2].data).toBe('1215');
});
