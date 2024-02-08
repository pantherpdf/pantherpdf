/**
 * @jest-environment ./src/JSDOMExtEnvironment.ts
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023-2024
 * @license MIT
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import PrintPreview from './PrintPreview';
import type { GeneralProps } from './types';
import { defaultWidgets } from '../widgets/allWidgets';
import { defaultTransforms } from '../transforms/allTransforms';
import type { Report } from '../types';
import type { WidgetItem } from '../widgets/types';
import type { SourceData } from '../data/fetchSourceData';

test('RenderPreview should prepare a document', async () => {
  const widgets: WidgetItem[] = [
    {
      type: 'TextSimple',
      value: { formula: '"Hello " + data.hello' },
      children: [],
    },
  ];

  const report: Report = {
    widgets,
    transforms: [],
    properties: {},
    variables: [],
  };

  const sourceData: SourceData = {
    type: 'as-is',
    value: { hello: 'world' },
  };

  const props: GeneralProps = {
    layout: 'fullscreen',
    report,
    setReport: () => {},
    api: {},
    sourceData,

    selected: null,
    setSelected: () => {},
    sourceDataOverride: undefined,
    setSourceDataOverride: () => {},
    renderWidget: () => {
      throw new Error('Not implemented');
    },
    renderWidgets: () => {
      throw new Error('Not implemented');
    },
    dragWidgetStart: () => {},
    dragWidgetEnd: () => {},
    drop: () => {},

    transforms: defaultTransforms,
    widgets: defaultWidgets,
    navbar: {},
  };

  render(<PrintPreview {...props} />);
  const iframe = await screen.findByTitle('Preview');
  const src = iframe.getAttribute('srcDoc');
  expect(src).toContain('<div>Hello world</div>');
});
