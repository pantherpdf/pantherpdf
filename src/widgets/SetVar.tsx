/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import React from 'react';
import type { WidgetItem, WidgetCompiled, Widget } from './types';
import { faHammer } from '@fortawesome/free-solid-svg-icons';
import WidgetEditorName from './WidgetEditorName';
import InputApplyOnEnter, {
  inputFAdornment,
} from '../components/InputApplyOnEnter';
import trans, { transName } from '../translation';
import TextField from '@mui/material/TextField';
import { FormulaObject } from '../types';

export interface SetVarData extends WidgetItem {
  type: 'SetVar';
  source: FormulaObject;
  varName: string;
  varValue?: unknown;
}

export interface SetVarCompiled extends WidgetCompiled {
  type: 'SetVar';
  children: WidgetCompiled[];
}

export const SetVar: Widget = {
  id: 'SetVar',
  name: { en: 'SetVar', sl: 'Spremenljivka' },
  icon: faHammer,

  newItem: async (): Promise<SetVarData> => {
    return {
      type: 'SetVar',
      children: [],
      source: { formula: '0' },
      varName: 'var',
    };
  },

  compile: async (item, helper): Promise<SetVarCompiled> => {
    const dt = item as SetVarData;
    dt.varValue = await helper.evalFormula(dt.source);
    if (dt.varValue === undefined) {
      // undefined in evaluateFormula means variable doesnt exist
      throw new Error('SetVar should not set variable value to undefined');
    }
    helper.formulaHelper.push(dt.varName, () => dt.varValue);
    const children = await helper.compileChildren(dt.children, helper);
    helper.formulaHelper.pop();
    delete dt.varValue;
    return {
      type: dt.type,
      children,
    };
  },

  Editor: function (props) {
    const item = props.item as SetVarData;
    return (
      <WidgetEditorName
        {...props}
        name={`${transName(SetVar.name)} - ${item.varName}`}
      >
        {props.renderWidgets(props.item.children, props.wid)}
      </WidgetEditorName>
    );
  },

  Preview: function (props) {
    const item = props.item as SetVarCompiled;
    return <>{props.renderChildren(item.children, props)}</>;
  },

  Properties: function (props) {
    const item = props.item as SetVarData;
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          value={item.source.formula}
          onChange={val => props.setItem({ ...item, source: { formula: val } })}
          label={trans('source data')}
          id="SetVar-source"
          InputProps={inputFAdornment}
        />

        <InputApplyOnEnter
          component={TextField}
          value={item.varName}
          onChange={val => props.setItem({ ...item, varName: val })}
          label={trans('varName')}
          id="SetVar-varName"
          helperText={trans('repeat - current item is this var')}
        />
      </>
    );
  },
};
