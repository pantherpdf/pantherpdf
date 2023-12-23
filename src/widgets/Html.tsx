/**
 * @file Render html
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import type { Item, ItemCompiled, Widget } from './types';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import BoxName from './BoxName';
import InputApplyOnEnter, { inputFAdornment } from './InputApplyOnEnter';
import Trans from '../translation';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

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
        <Typography fontFamily="monospace">{item.source}</Typography>
      </BoxName>
    );
  },

  RenderPreview: function (props) {
    const item = props.item as HtmlCompiled;
    return <div dangerouslySetInnerHTML={{ __html: item.data }} />;
  },

  RenderProperties: function (props) {
    const item = props.item as HtmlData;
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          value={item.source}
          onChange={val => props.setItem({ ...item, source: val })}
          label={Trans('source data')}
          id="Html-source"
          InputProps={inputFAdornment}
        />
      </>
    );
  },
};
