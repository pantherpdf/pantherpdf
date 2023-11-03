/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React from 'react';
import { Item, ItemCompiled, tuple } from '../types';
import type { Widget } from '../editor/types';
import { faArrowsAltV } from '@fortawesome/free-solid-svg-icons';
import PropertySlider from './PropertySlider';
import Trans from '../translation';
import BoxName from './BoxName';

export const TBorderStyles = tuple('dotted', 'dashed', 'solid');
export type TBorderStyle = (typeof TBorderStyles)[number];

interface Properties {
  height: number;
}
export type SpacerData = Item & Properties;
export type SpacerCompiled = ItemCompiled & Properties;

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

  RenderEditor: function (props) {
    const item = props.item as SpacerData;
    return (
      <BoxName {...props} name={Spacer.name}>
        <div style={{ height: `${item.height}px` }} />
      </BoxName>
    );
  },

  RenderPreview: function (props) {
    const item = props.item as SpacerCompiled;
    return `<div style="height: ${item.height}px"></div>\n`;
  },

  RenderProperties: function (props) {
    const item = props.item as SpacerData;
    return (
      <>
        <PropertySlider
          id="spacer-height"
          label={Trans('height')}
          min={3}
          max={300}
          value={item.height}
          onChange={val => props.setItem({ ...item, height: val })}
        />
      </>
    );
  },
};
