/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React from 'react';
import { Item, ItemCompiled } from '../types';
import type { Widget } from '../editor/types';
import { faHammer } from '@fortawesome/free-solid-svg-icons';
import BoxName from './BoxName';
import InputApplyOnEnter, { inputFAdornment } from './InputApplyOnEnter';
import Trans, { TransName } from '../translation';
import TextField from '@mui/material/TextField';

export interface SetVarData extends Item {
  type: 'SetVar';
  source: string;
  varName: string;
  varValue: unknown;
}

export interface SetVarCompiled extends ItemCompiled {
  type: 'SetVar';
  children: ItemCompiled[];
}

export const SetVar: Widget = {
  id: 'SetVar',
  name: { en: 'SetVar', sl: 'Spremenljivka' },
  icon: faHammer,

  newItem: async (): Promise<SetVarData> => {
    return {
      type: 'SetVar',
      children: [],
      source: '0',
      varName: 'var',
      varValue: undefined,
    };
  },

  compile: async (dt: SetVarData, helper): Promise<SetVarCompiled> => {
    dt.varValue = await helper.evalFormula(dt.source);
    if (dt.varValue === undefined) {
      // undefined in evaluateFormula means variable doesnt exist
      throw new Error('SetVar should not set variable value to undefined');
    }
    helper.formulaHelper.push(dt.varName, () => dt.varValue);
    const children = await helper.compileChildren(dt.children, helper);
    helper.formulaHelper.pop();
    dt.varValue = undefined;
    return {
      type: dt.type,
      children,
    };
  },

  RenderEditor: function (props) {
    const item = props.item as SetVarData;
    return (
      <BoxName {...props} name={`${TransName(SetVar.name)} - ${item.varName}`}>
        {props.renderWidgets(props.item.children, props.wid)}
      </BoxName>
    );
  },

  RenderPreview: function (props) {
    const item = props.item as SetVarCompiled;
    return <>{props.renderChildren(item.children, props)}</>;
  },

  RenderProperties: function (props) {
    const item = props.item as SetVarData;
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          value={item.source}
          onChange={val => props.setItem({ ...item, source: val })}
          label={Trans('source data')}
          id="SetVar-source"
          InputProps={inputFAdornment}
        />

        <InputApplyOnEnter
          component={TextField}
          value={item.varName}
          onChange={val => props.setItem({ ...item, varName: val })}
          label={Trans('varName')}
          id="SetVar-varName"
          helperText={Trans('repeat - current item is this var')}
        />
      </>
    );
  },
};
