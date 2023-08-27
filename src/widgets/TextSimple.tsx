/**
 * TextSimple.tsx
 */

import React from 'react';
import { Item, ItemCompiled } from '../types';
import type { Widget } from '../editor/types';
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import BoxName from './BoxName';
import InputApplyOnEnter from './InputApplyOnEnter';

export interface TextSimpleData extends Item {
  type: 'TextSimple';
  formula: string;
}

export interface TextSimpleCompiled extends ItemCompiled {
  type: 'TextSimple';
  data: string;
}

export const TextSimple: Widget = {
  id: 'TextSimple',
  name: { en: 'Text Simple', sl: 'Besedilo Simple' },
  icon: faAlignLeft,

  newItem: async (): Promise<TextSimpleData> => {
    return {
      type: 'TextSimple',
      children: [],
      formula: '',
    };
  },

  compile: async (dt: TextSimpleData, helpers): Promise<TextSimpleCompiled> => {
    const str2 = await helpers.evalFormula(dt.formula);
    const str =
      str2 !== undefined && str2 !== null && str2 !== false ? String(str2) : '';
    return {
      type: dt.type,
      data: str,
    };
  },

  RenderEditor: function (props) {
    const item = props.item as TextSimpleData;
    return (
      <BoxName {...props} name={TextSimple.name}>
        <div>{item.formula}</div>
      </BoxName>
    );
  },

  RenderPreview: function (props) {
    const item = props.item as TextSimpleCompiled;
    return `<div>${props.escapeHtml(item.data)}</div>\n`;
  },

  RenderProperties: function (props) {
    const item = props.item as TextSimpleData;
    return (
      <>
        <div className="input-group mb-3">
          <span className="input-group-text fst-italic">ƒ</span>
          <InputApplyOnEnter
            id="TextSimple-formula"
            value={item.formula}
            onChange={val => props.setItem({ ...item, formula: val })}
          />
        </div>
      </>
    );
  },

  canAdd: false,
};
