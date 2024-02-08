/**
 * @file Render html
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import React from 'react';
import type { WidgetItem, WidgetCompiled, Widget } from './types';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import WidgetEditorName from './WidgetEditorName';
import InputApplyOnEnter, {
  inputFAdornment,
} from '../components/InputApplyOnEnter';
import trans from '../translation';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormulaObject } from '../types';

export interface HtmlData extends WidgetItem {
  type: 'Html';
  source: FormulaObject;
}

export interface HtmlCompiled extends WidgetCompiled {
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
      source: { formula: '' },
    };
  },

  compile: async (item, helpers): Promise<HtmlCompiled> => {
    const dt = item as HtmlData;
    const str2 = await helpers.evalFormula(dt.source);
    const str =
      str2 !== undefined && str2 !== null && str2 !== false ? String(str2) : '';
    return {
      type: dt.type,
      data: str,
    };
  },

  Editor: function (props) {
    const item = props.item as HtmlData;
    return (
      <WidgetEditorName {...props} name={Html.name}>
        <Typography fontFamily="monospace">{item.source.formula}</Typography>
      </WidgetEditorName>
    );
  },

  Preview: function (props) {
    const item = props.item as HtmlCompiled;
    return <div dangerouslySetInnerHTML={{ __html: item.data }} />;
  },

  Properties: function (props) {
    const item = props.item as HtmlData;
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          value={item.source.formula}
          onChange={val => props.setItem({ ...item, source: { formula: val } })}
          label={trans('source data')}
          id="Html-source"
          InputProps={inputFAdornment}
        />
      </>
    );
  },
};
