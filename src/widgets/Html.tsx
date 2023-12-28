/**
 * @file Render html
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
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

export interface HtmlData extends WidgetItem {
  type: 'Html';
  source: string;
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

  Editor: function (props) {
    const item = props.item as HtmlData;
    return (
      <WidgetEditorName {...props} name={Html.name}>
        <Typography fontFamily="monospace">{item.source}</Typography>
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
          value={item.source}
          onChange={val => props.setItem({ ...item, source: val })}
          label={trans('source data')}
          id="Html-source"
          InputProps={inputFAdornment}
        />
      </>
    );
  },
};
