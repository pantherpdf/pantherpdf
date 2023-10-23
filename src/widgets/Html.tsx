/**
 * @file Render html
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React from 'react';
import { Item, ItemCompiled } from '../types';
import type { Widget } from '../editor/types';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import BoxName from './BoxName';
import InputApplyOnEnter from './InputApplyOnEnter';
import Trans from '../translation';
import globalStyle from '../globalStyle.module.css';

export interface HtmlData extends Item {
  type: 'Html';
  source: string;
}

export interface HtmlCompiled extends ItemCompiled {
  type: 'Html';
  data: string;
}

export const Html: Widget = {
  id: 'Html',
  name: { en: 'Html', sl: 'Html' },
  icon: faCode,

  newItem: async (): Promise<HtmlData> => {
    return {
      type: 'Html',
      children: [],
      source: '',
    };
  },

  compile: async (dt: HtmlData, helpers): Promise<HtmlCompiled> => {
    const str2 = await helpers.evalFormula(dt.source);
    const str =
      str2 !== undefined && str2 !== null && str2 !== false ? String(str2) : '';
    return {
      type: dt.type,
      data: str,
    };
  },

  RenderEditor: function (props) {
    const item = props.item as HtmlData;
    return (
      <BoxName {...props} name={Html.name}>
        <div className="font-monospace">{item.source}</div>
      </BoxName>
    );
  },

  RenderPreview: function (props) {
    const item = props.item as HtmlCompiled;
    return `<div>
			${item.data}
		</div>\n`;
  },

  RenderProperties: function (props) {
    const item = props.item as HtmlData;
    return (
      <>
        <div className={globalStyle.vform}>
          <label htmlFor="Html-source">{Trans('source data')}</label>
          <div className="input-group">
            <span className="input-group-text fst-italic">ƒ</span>
            <InputApplyOnEnter
              id="Html-source"
              value={item.source}
              onChange={val => props.setItem({ ...item, source: val })}
            />
          </div>
        </div>
      </>
    );
  },
};
