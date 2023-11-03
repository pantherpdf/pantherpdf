/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React from 'react';
import { Item, ItemCompiled } from '../types';
import type { Widget } from '../editor/types';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import BoxName from './BoxName';
import InputApplyOnEnter, { inputFAdornment } from './InputApplyOnEnter';
import Trans, { TransName } from '../translation';
import TextField from '@mui/material/TextField';

export interface ConditionData extends Item {
  type: 'Condition';
  formula: string;
}

export interface ConditionCompiled extends ItemCompiled {
  type: 'Condition';
  children: ItemCompiled[];
}

export const Condition: Widget = {
  id: 'Condition',
  name: { en: 'Condition', sl: 'Pogoj' },
  icon: faCodeBranch,

  newItem: async (): Promise<ConditionData> => {
    return {
      type: 'Condition',
      children: [],
      formula: 'true',
    };
  },

  compile: async (dt: ConditionData, helper): Promise<ConditionCompiled> => {
    const ok = await helper.evalFormula(dt.formula);
    return {
      type: dt.type,
      children: ok ? await helper.compileChildren(dt.children, helper) : [],
    };
  },

  RenderEditor: function (props) {
    const item = props.item as ConditionData;
    return (
      <BoxName
        {...props}
        name={TransName(Condition.name) + ': ' + item.formula}
      >
        {props.renderWidgets(item.children, props.wid)}
      </BoxName>
    );
  },

  RenderPreview: function (props) {
    const item = props.item as ConditionCompiled;
    return props.renderChildren(item.children, props);
  },

  RenderProperties: function (props) {
    const item = props.item as ConditionData;
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          value={item.formula}
          onChange={val => props.setItem({ ...item, formula: val })}
          label={Trans('formula')}
          id="Condition-formula"
          InputProps={inputFAdornment}
        />
      </>
    );
  },
};
