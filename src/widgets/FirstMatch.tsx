/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React from 'react';
import { Item, ItemCompiled } from '../types';
import type { Widget } from '../editor/types';
import { faHandRock } from '@fortawesome/free-solid-svg-icons';
import BoxName from './BoxName';
import InputApplyOnEnter from './InputApplyOnEnter';
import Trans, { TransName } from '../translation';
import globalStyle from '../globalStyle.module.css';

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
    return props.renderChildren(item.children, props);
  },

  RenderProperties: function (props) {
    const item = props.item as FirstMatchData;
    return (
      <>
        <div className={globalStyle.vform}>
          <label htmlFor="FirstMatch-source">{Trans('source data')}</label>
          <div className="input-group mb-3">
            <span className="input-group-text fst-italic">ƒ</span>
            <InputApplyOnEnter
              id="FirstMatch-source"
              value={item.source}
              onChange={val => props.setItem({ ...item, source: val })}
            />
          </div>
        </div>

        <div className={`${globalStyle.vform} mb-0`}>
          <label htmlFor="FirstMatch-condition">{Trans('condition')}</label>
          <div className="input-group">
            <span className="input-group-text fst-italic">ƒ</span>
            <InputApplyOnEnter
              id="FirstMatch-condition"
              value={item.condition}
              onChange={val => props.setItem({ ...item, condition: val })}
            />
          </div>
        </div>
        <small className="text-muted d-block mb-3">
          {Trans('current item is in var -name-', [item.varName])}
        </small>

        <div className={`${globalStyle.vform} mb-0`}>
          <label htmlFor="FirstMatch-varName" className="d-block">
            {Trans('varName')}
          </label>
          <InputApplyOnEnter
            id="FirstMatch-varName"
            value={item.varName}
            onChange={val => props.setItem({ ...item, varName: val })}
          />
        </div>
        <small className="text-muted d-block mb-3">
          {Trans('repeat - current item is this var')}
        </small>
      </>
    );
  },
};
