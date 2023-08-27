/**
 * Condition.tsx
 */

import React from 'react';
import { Item, ItemCompiled } from '../types';
import type { Widget } from '../editor/types';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import BoxName from './BoxName';
import InputApplyOnEnter from './InputApplyOnEnter';
import Trans, { TransName } from '../translation';
import globalStyle from '../globalStyle.module.css';

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
        <div className={globalStyle.vform}>
          <label htmlFor="Condition-formula">{Trans('formula')}</label>
          <div className="input-group mb-3">
            <span className="input-group-text fst-italic">ƒ</span>
            <InputApplyOnEnter
              id="Condition-formula"
              value={item.formula}
              onChange={val => props.setItem({ ...item, formula: val })}
            />
          </div>
        </div>
      </>
    );
  },
};
