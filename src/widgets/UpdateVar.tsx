/**
 * UpdateVar.tsx
 */

import React from 'react';
import { TData, TDataCompiled, TReport } from '../types';
import type { Widget } from '../editor/types';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import BoxName from './BoxName';
import InputApplyOnEnter from './InputApplyOnEnter';
import { findInList } from '../editor/childrenMgmt';
import Trans from '../translation';
import { SetVarData } from './SetVar';
import globalStyle from '../globalStyle.module.css';

interface GetAllVars {
  name: string;
  owner: SetVarData | undefined;
}
function getAllVars(report: TReport, wid: number[]): GetAllVars[] {
  wid = [...wid];
  // return array to keep correct order
  const arr: GetAllVars[] = [];
  const tmpVarNames: { [key: string]: boolean } = {};
  // SetVar
  while (wid.length > 0) {
    const w = findInList(report, wid);
    if (w.type === 'SetVar') {
      const item = w as SetVarData;
      if (!(item.varName in tmpVarNames)) {
        tmpVarNames[item.varName] = true;
        arr.push({ name: item.varName, owner: item });
      }
    }
    wid.splice(wid.length - 1, 1);
  }
  // report
  for (const v of report.variables) {
    if (!(v.name in tmpVarNames)) {
      tmpVarNames[v.name] = true;
      arr.push({ name: v.name, owner: undefined });
    }
  }
  return arr;
}

export interface UpdateVarData extends TData {
  type: 'UpdateVar';
  varName: string;
  formula: string;
}

export interface UpdateVarCompiled extends TDataCompiled {
  type: 'UpdateVar';
}

export const UpdateVar: Widget = {
  name: { en: 'Update Variable', sl: 'Spremeni Spremenljivko' },
  icon: { fontawesome: faPlusSquare },

  newItem: async (): Promise<UpdateVarData> => {
    return {
      type: 'UpdateVar',
      children: [],
      varName: '',
      formula: '',
    };
  },

  compile: async (dt: UpdateVarData, helper): Promise<UpdateVarCompiled> => {
    const value = await helper.evalFormula(dt.formula);
    if (value === undefined) {
      // undefined in evaluateFormula means variable doesnt exist
      throw new Error('UpdateVar should not set undefined');
    }
    const vars = getAllVars(helper.report, helper.wid);
    const v = vars.find(v => v.name === dt.varName);
    if (!v) {
      throw new Error('var doesnt exist');
    }
    if (v.owner) {
      v.owner.varValue = value;
    } else {
      helper.variables[dt.varName] = value;
    }
    return {
      type: dt.type,
    };
  },

  Render: function (props) {
    const item = props.item as UpdateVarData;
    function Impl() {
      const vars = getAllVars(props.report, props.wid);
      if (item.varName.length === 0) {
        return (
          <span className="text-danger">
            {Trans('UpdateVar error variable not selected')}
          </span>
        );
      }
      const varExists = vars.find(v => v.name === item.varName);
      if (!varExists) {
        return (
          <span className="text-danger">
            {Trans('UpdateVar error variable doesnt exist')}
          </span>
        );
      }
      if (item.formula.trim().length === 0) {
        return (
          <span className="text-danger">
            {Trans('UpdateVar error formula empty')}
          </span>
        );
      }
      return (
        <span
          className="text-muted fst-italic font-monospace"
          style={{ fontSize: '9px' }}
        >
          {item.varName} = {item.formula}
        </span>
      );
    }
    return (
      <BoxName {...props} name={UpdateVar.name}>
        <Impl />
      </BoxName>
    );
  },

  RenderFinal: function (props) {
    return '';
  },

  RenderProperties: function (props) {
    const vars = getAllVars(props.report, props.wid);
    const item = props.item as UpdateVarData;
    const varData = vars.find(v => v.name === 'data' && v.owner === undefined);
    const varReport = vars.find(
      v => v.name === 'report' && v.owner === undefined,
    );
    return (
      <>
        <div className={globalStyle.vform}>
          <label htmlFor="UpdateVar-varName">{Trans('varName')}</label>
          <select
            className="form-select"
            value={item.varName}
            onChange={e =>
              props.setItem({ ...item, varName: e.currentTarget.value })
            }
            id="UpdateVar-varName"
          >
            {!vars.find(v => v.name === item.varName) && (
              <option value={item.varName}></option>
            )}
            {vars.map(v => (
              <option value={v.name} key={v.name}>
                {v.name}
              </option>
            ))}
            {varData && (
              <option value="data" disabled>
                data
              </option>
            )}
            {varReport && (
              <option value="report" disabled>
                report
              </option>
            )}
          </select>
        </div>

        <div className={globalStyle.vform}>
          <label htmlFor="UpdateVar-Formula">{Trans('formula')}</label>
          <div className="input-group">
            <span className="input-group-text fst-italic">ƒ</span>
            <InputApplyOnEnter
              id="UpdateVar-Formula"
              value={item.formula}
              onChange={val => props.setItem({ ...item, formula: val })}
            />
          </div>
        </div>
      </>
    );
  },
};
