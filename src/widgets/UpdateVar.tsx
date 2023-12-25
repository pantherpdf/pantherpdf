/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import type { Report } from '../types';
import type { Widget, WidgetItem, WidgetCompiled } from './types';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import WidgetEditorName from './WidgetEditorName';
import InputApplyOnEnter, { inputFAdornment } from './InputApplyOnEnter';
import { findInList } from '../editor/childrenMgmt';
import trans from '../translation';
import { SetVarData } from './SetVar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

interface GetAllVars {
  name: string;
  owner: SetVarData | undefined;
}
function getAllVars(report: Report, wid: number[]): GetAllVars[] {
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

export interface UpdateVarData extends WidgetItem {
  type: 'UpdateVar';
  varName: string;
  formula: string;
}

export interface UpdateVarCompiled extends WidgetCompiled {
  type: 'UpdateVar';
}

export const UpdateVar: Widget = {
  id: 'UpdateVar',
  name: { en: 'Update Variable', sl: 'Spremeni Spremenljivko' },
  icon: faPlusSquare,

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

  Editor: function (props) {
    const item = props.item as UpdateVarData;
    function Impl() {
      const vars = getAllVars(props.report, props.wid);
      if (item.varName.length === 0) {
        return (
          <Alert severity="error">
            {trans('UpdateVar error variable not selected')}
          </Alert>
        );
      }
      const varExists = vars.find(v => v.name === item.varName);
      if (!varExists) {
        return (
          <Alert severity="error">
            {trans('UpdateVar error variable doesnt exist')}
          </Alert>
        );
      }
      if (item.formula.trim().length === 0) {
        return (
          <Alert severity="error">
            {trans('UpdateVar error formula empty')}
          </Alert>
        );
      }
      return (
        <Typography
          component="span"
          color="GrayText"
          fontFamily="monospace"
          fontStyle="italic"
          fontSize="9px"
        >
          {item.varName} = {item.formula}
        </Typography>
      );
    }
    return (
      <WidgetEditorName {...props} name={UpdateVar.name}>
        <Impl />
      </WidgetEditorName>
    );
  },

  Preview: function (props) {
    return null;
  },

  Properties: function (props) {
    const vars = getAllVars(props.report, props.wid);
    const item = props.item as UpdateVarData;
    const varData = vars.find(v => v.name === 'data' && v.owner === undefined);
    const varReport = vars.find(
      v => v.name === 'report' && v.owner === undefined,
    );
    return (
      <>
        <TextField
          select
          label={trans('varName')}
          value={item.varName}
          onChange={e => props.setItem({ ...item, varName: e.target.value })}
          id="UpdateVar-varName"
        >
          {!vars.find(v => v.name === item.varName) && (
            <MenuItem value={item.varName}></MenuItem>
          )}
          {vars.map(v => (
            <MenuItem value={v.name} key={v.name}>
              {v.name}
            </MenuItem>
          ))}
          {varData && (
            <MenuItem value="data" disabled>
              data
            </MenuItem>
          )}
          {varReport && (
            <MenuItem value="report" disabled>
              report
            </MenuItem>
          )}
        </TextField>

        <InputApplyOnEnter
          component={TextField}
          value={item.formula}
          onChange={val => props.setItem({ ...item, formula: val })}
          label={trans('formula')}
          id="UpdateVar-Formula"
          InputProps={inputFAdornment}
        />
      </>
    );
  },
};
