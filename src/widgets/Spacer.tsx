/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import type { WidgetItem, WidgetCompiled, Widget } from './types';
import { tuple } from '../types';
import { faArrowsAltV } from '@fortawesome/free-solid-svg-icons';
import PropertySlider from './PropertySlider';
import trans from '../translation';
import WidgetEditorName from './WidgetEditorName';

export const TBorderStyles = tuple('dotted', 'dashed', 'solid');
export type TBorderStyle = (typeof TBorderStyles)[number];

interface Properties {
  /** px */
  height: number;
}
export type SpacerData = WidgetItem & Properties;
export type SpacerCompiled = WidgetCompiled & Properties;

export const Spacer: Widget = {
  id: 'Spacer',
  name: { en: 'Spacer', sl: 'Presledek' },
  icon: faArrowsAltV,

  newItem: async (): Promise<SpacerData> => {
    return {
      type: 'Spacer',
      children: [],
      height: 50,
    };
  },

  compile: async (dt: SpacerData, helpers): Promise<SpacerCompiled> => {
    return {
      ...dt,
    };
  },

  Editor: function (props) {
    const item = props.item as SpacerData;
    return (
      <WidgetEditorName {...props} name={Spacer.name}>
        <div style={{ height: `${item.height}px` }} />
      </WidgetEditorName>
    );
  },

  Preview: function (props) {
    const item = props.item as SpacerCompiled;
    return <div style={{ height: `${item.height}px` }} />;
  },

  Properties: function (props) {
    const item = props.item as SpacerData;
    return (
      <>
        <PropertySlider
          id="spacer-height"
          label={trans('height')}
          min={3}
          max={300}
          value={item.height}
          onChange={val => props.setItem({ ...item, height: val })}
        />
      </>
    );
  },
};
