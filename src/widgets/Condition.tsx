/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import type { WidgetItem, WidgetCompiled, Widget } from './types';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import WidgetEditorName from './WidgetEditorName';
import InputApplyOnEnter, {
  inputFAdornment,
} from '../components/InputApplyOnEnter';
import trans, { transName } from '../translation';
import TextField from '@mui/material/TextField';

export interface ConditionData extends WidgetItem {
  type: 'Condition';
  formula: string;
}

export interface ConditionCompiled extends WidgetCompiled {
  type: 'Condition';
  children: WidgetCompiled[];
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

  Editor: function (props) {
    const item = props.item as ConditionData;
    return (
      <WidgetEditorName
        {...props}
        name={transName(Condition.name) + ': ' + item.formula}
      >
        {props.renderWidgets(item.children, props.wid)}
      </WidgetEditorName>
    );
  },

  Preview: function (props) {
    const item = props.item as ConditionCompiled;
    return <>{props.renderChildren(item.children, props)}</>;
  },

  Properties: function (props) {
    const item = props.item as ConditionData;
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          value={item.formula}
          onChange={val => props.setItem({ ...item, formula: val })}
          label={trans('formula')}
          id="Condition-formula"
          InputProps={inputFAdornment}
        />
      </>
    );
  },
};
