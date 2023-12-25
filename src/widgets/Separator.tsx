/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { CSSProperties } from 'react';
import type { WidgetItem, WidgetCompiled, Widget } from './types';
import { tuple } from '../types';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import PropertyBorder, { Border, genBorderCss } from './PropertyBorder';
import trans from '../translation';
import WidgetEditorName from './WidgetEditorName';
import PropertySlider from './PropertySlider';
import SectionName from '../components/SectionName';

export const TBorderStyles = tuple('dotted', 'dashed', 'solid');
export type TBorderStyle = (typeof TBorderStyles)[number];

interface Properties {
  marginTop: number;
  marginBottom: number;
  border: Border;
}
export type SeparatorData = WidgetItem & Properties;
export type SeparatorCompiled = WidgetCompiled & Properties;

function GenStyle(item: SeparatorData | SeparatorCompiled): CSSProperties {
  return {
    marginTop: `${item.marginTop}px`,
    marginBottom: `${item.marginBottom}px`,
    borderTop: genBorderCss(item.border),
    borderRight: 'none',
    borderBottom: 'none',
    borderLeft: 'none',
    opacity: '1',
    color: 'transparent',
  };
}

export const Separator: Widget = {
  id: 'Separator',
  name: { en: 'Separator', sl: 'Črta' },
  icon: faMinus,

  newItem: async (): Promise<SeparatorData> => {
    return {
      type: 'Separator',
      children: [],
      marginTop: 20,
      marginBottom: 20,
      border: {
        width: 1,
        style: 'solid',
        color: '#999999',
      },
    };
  },

  compile: async (dt: SeparatorData, helpers): Promise<SeparatorCompiled> => {
    return {
      ...dt,
    };
  },

  Editor: function (props) {
    const item = props.item as SeparatorData;
    return (
      <WidgetEditorName {...props} name={Separator.name}>
        <hr style={GenStyle(item)} />
      </WidgetEditorName>
    );
  },

  Preview: function (props) {
    const item = props.item as SeparatorCompiled;
    const style = GenStyle(item);
    return <hr style={style} />;
  },

  Properties: function (props) {
    const item = props.item as SeparatorData;
    return (
      <>
        <PropertyBorder
          id="sep-border"
          value={item.border}
          onChange={val => props.setItem({ ...props.item, border: val })}
        />

        <SectionName text={trans('margin top')} />
        <PropertySlider
          id="sep-marginTop"
          min={0}
          max={40}
          value={item.marginTop}
          onChange={val => props.setItem({ ...props.item, marginTop: val })}
        />

        <SectionName text={trans('margin bottom')} />
        <PropertySlider
          id="sep-marginBottom"
          min={0}
          max={40}
          value={item.marginBottom}
          onChange={val => props.setItem({ ...props.item, marginBottom: val })}
        />
      </>
    );
  },
};
