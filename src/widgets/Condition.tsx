/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
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
import { FormulaObject } from '../types';

export interface ConditionData extends WidgetItem {
  type: 'Condition';
  condition: FormulaObject;
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
      condition: { formula: 'true' },
    };
  },

  compile: async (item, helper): Promise<ConditionCompiled> => {
    const dt = item as ConditionData;
    const ok = await helper.evalFormula(dt.condition);
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
          value={item.condition.formula}
          onChange={val =>
            props.setItem({ ...item, condition: { formula: val } })
          }
          label={trans('formula')}
          id="Condition-formula"
          InputProps={inputFAdornment}
        />
      </>
    );
  },
};
