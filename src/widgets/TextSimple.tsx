/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import React from 'react';
import type { WidgetItem, WidgetCompiled, Widget } from './types';
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import WidgetEditorName from './WidgetEditorName';
import InputApplyOnEnter, {
  inputFAdornment,
} from '../components/InputApplyOnEnter';
import TextField from '@mui/material/TextField';
import { FormulaObject } from '../types';

export interface TextSimpleData extends WidgetItem {
  type: 'TextSimple';
  value: FormulaObject;
}

export interface TextSimpleCompiled extends WidgetCompiled {
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
      value: { formula: '' },
    };
  },

  compile: async (item, helpers): Promise<TextSimpleCompiled> => {
    const dt = item as TextSimpleData;
    const str2 = await helpers.evalFormula(dt.value);
    const str =
      str2 !== undefined && str2 !== null && str2 !== false ? String(str2) : '';
    return {
      type: dt.type,
      data: str,
    };
  },

  Editor: function (props) {
    const item = props.item as TextSimpleData;
    return (
      <WidgetEditorName {...props} name={TextSimple.name}>
        <div>{item.value.formula}</div>
      </WidgetEditorName>
    );
  },

  Preview: function (props) {
    const item = props.item as TextSimpleCompiled;
    return <div>{item.data}</div>;
  },

  Properties: function (props) {
    const item = props.item as TextSimpleData;
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          id="TextSimple-formula"
          value={item.value.formula}
          onChange={val => props.setItem({ ...item, value: { formula: val } })}
          InputProps={inputFAdornment}
        />
      </>
    );
  },

  canAdd: false,
};
