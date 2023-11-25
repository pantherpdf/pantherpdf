/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import { Item, ItemCompiled } from '../types';
import type { Widget } from '../editor/types';
import { faHandRock } from '@fortawesome/free-solid-svg-icons';
import BoxName from './BoxName';
import InputApplyOnEnter, { inputFAdornment } from './InputApplyOnEnter';
import Trans, { TransName } from '../translation';
import TextField from '@mui/material/TextField';

export interface FirstMatchData extends Item {
  type: 'FirstMatch';
  source: string;
  condition: string;
  varName: string;
}

export interface FirstMatchCompiled extends ItemCompiled {
  type: 'FirstMatch';
  children: ItemCompiled[];
}

export const FirstMatch: Widget = {
  id: 'FirstMatch',
  name: { en: 'FirstMatch', sl: 'Prvi ustrezen' },
  icon: faHandRock,

  newItem: async (): Promise<FirstMatchData> => {
    return {
      type: 'FirstMatch',
      children: [],
      source: '[]',
      condition: 'true',
      varName: 'match1',
    };
  },

  compile: async (dt: FirstMatchData, helper): Promise<FirstMatchCompiled> => {
    const arr = await helper.evalFormula(dt.source);
    if (!Array.isArray(arr)) {
      throw new Error(
        `FirstMatch: source should be array bot got ${typeof arr}`,
      );
    }
    let obj;
    let found = false;
    for (const itm of arr) {
      helper.formulaHelper.push(dt.varName, itm);
      const xx = await helper.evalFormula(dt.condition);
      helper.formulaHelper.pop();
      if (xx) {
        obj = itm;
        found = true;
        break;
      }
    }
    helper.formulaHelper.push(dt.varName, obj);
    const result: FirstMatchCompiled = {
      type: dt.type,
      children: found ? await helper.compileChildren(dt.children, helper) : [],
    };
    helper.formulaHelper.pop();
    return result;
  },

  RenderEditor: function (props) {
    const item = props.item as FirstMatchData;
    return (
      <BoxName
        {...props}
        name={`${TransName(FirstMatch.name)}: ${item.varName}`}
      >
        {props.renderWidgets(item.children, props.wid)}
      </BoxName>
    );
  },

  RenderPreview: function (props) {
    const item = props.item as FirstMatchCompiled;
    return <>{props.renderChildren(item.children, props)}</>;
  },

  RenderProperties: function (props) {
    const item = props.item as FirstMatchData;
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          value={item.source}
          onChange={val => props.setItem({ ...item, source: val })}
          label={Trans('source data')}
          id="FirstMatch-source"
          InputProps={inputFAdornment}
        />

        <InputApplyOnEnter
          component={TextField}
          value={item.condition}
          onChange={val => props.setItem({ ...item, condition: val })}
          label={Trans('condition')}
          id="FirstMatch-condition"
          InputProps={inputFAdornment}
          helperText={Trans('current item is in var -name-', [item.varName])}
        />

        <InputApplyOnEnter
          component={TextField}
          value={item.varName}
          onChange={val => props.setItem({ ...item, varName: val })}
          label={Trans('varName')}
          id="FirstMatch-varName"
          helperText={Trans('repeat - current item is this var')}
        />
      </>
    );
  },
};
