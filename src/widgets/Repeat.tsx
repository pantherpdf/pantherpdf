/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import React, { CSSProperties } from 'react';
import type { WidgetItem, WidgetCompiled, Widget } from './types';
import { FormulaObject, tuple } from '../types';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import WidgetEditorName from './WidgetEditorName';
import InputApplyOnEnter, {
  inputFAdornment,
} from '../components/InputApplyOnEnter';
import trans, { transName, trKeys } from '../translation';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

const RepeatDirections = tuple('rows', 'columns', 'grid');
type RepeatDirection = (typeof RepeatDirections)[number];
const RepeatDirectionTrans: { [key in RepeatDirection]: trKeys } = {
  rows: 'repeat - direction rows',
  columns: 'repeat - direction columns',
  grid: 'repeat - direction grid',
};

export interface RepeatData extends WidgetItem {
  type: 'Repeat';
  source: FormulaObject;
  varName: string;
  direction: RepeatDirection;
}

export interface RepeatCompiled extends WidgetCompiled {
  type: 'Repeat';
  children: WidgetCompiled[][];
  direction: RepeatDirection;
  addChildElement: boolean;
}

export const Repeat: Widget = {
  id: 'Repeat',
  name: { en: 'Repeat', sl: 'Ponavljaj' },
  icon: faEllipsisV,

  newItem: async (): Promise<RepeatData> => {
    return {
      type: 'Repeat',
      children: [],
      source: { formula: '' },
      varName: 'item',
      direction: 'rows',
    };
  },

  compile: async (item, helper): Promise<RepeatCompiled> => {
    const dt = item as RepeatData;
    const value = await helper.evalFormula(dt.source);
    if (!Array.isArray(value)) {
      throw new Error(
        `Repeat: expected source to be array but got ${typeof value}`,
      );
    }
    const children: WidgetCompiled[][] = [];
    for (let i = 0; i < value.length; ++i) {
      helper.formulaHelper.push(dt.varName, value[i]);
      helper.formulaHelper.push(dt.varName + '_i', i);
      const ch2 = await helper.compileChildren(dt.children, helper);
      children.push(ch2);
      helper.formulaHelper.pop();
      helper.formulaHelper.pop();
    }
    let addChildElement = true;
    if (dt.direction === 'grid') {
      // remove <div> when only one child and this child is frame
      if (dt.children.length === 1 && dt.children[0].type === 'Frame') {
        // dont display as flex because flex and page-break-inside: avoid dont work together
        // dont add additional div, so that frame can control width/height
        // add css to frame
        // inline-block to display them in line
        // vertical-align: top, to prevent vertical space between frames
        addChildElement = false;
        if (
          helper.propertiesCompiled.globalCss.indexOf('.grid-with-frame') === -1
        ) {
          helper.propertiesCompiled.globalCss += `
						.grid-with-frame > div {
							display: inline-block;
							vertical-align: top;
						}
					`;
        }
      }
    }
    return {
      type: dt.type,
      children,
      direction: dt.direction,
      addChildElement,
    };
  },

  Editor: function (props) {
    const item = props.item as RepeatData;
    return (
      <WidgetEditorName
        {...props}
        name={`${transName(Repeat.name)} - ${item.varName}`}
      >
        {props.item.children &&
          props.renderWidgets(props.item.children, props.wid)}
      </WidgetEditorName>
    );
  },

  Preview: function (props) {
    const item = props.item as RepeatCompiled;
    if (item.direction === 'rows') {
      // maybe add to cssItem:
      // pageBreakInside: 'avoid',  // must be present otherwise item in quotes gets breaked up
      return (
        <>
          {item.children.map((item, idx) => (
            <React.Fragment key={idx}>
              {props.renderChildren(item, props)}
            </React.Fragment>
          ))}
        </>
      );
    }
    const cssParent: CSSProperties = {};
    const cssItem: CSSProperties = {};
    if (item.direction === 'columns') {
      cssParent.display = 'flex';
      const w = item.children.length > 0 ? 1 / item.children.length : 1;
      cssItem.flex = `0 0 ${(w * 100).toLocaleString('en-US', {
        maximumFractionDigits: 4,
      })}%`;
    }
    if (item.direction === 'grid') {
      if (item.addChildElement) {
        cssParent.display = 'flex';
        cssParent.flexWrap = 'wrap';
      } else {
        cssParent.display = 'block';
      }
    }

    if (item.addChildElement) {
      return (
        <div style={cssParent}>
          {item.children.map((item2, idx) => {
            return (
              <div key={idx} style={cssItem}>
                {props.renderChildren(item2, props)}
              </div>
            );
          })}
        </div>
      );
    }
    //
    else {
      return (
        <div style={cssParent} className="grid-with-frame">
          {item.children.map((item2, idx2) => (
            <React.Fragment key={idx2}>
              {props.renderChildren(item2, props)}
            </React.Fragment>
          ))}
        </div>
      );
    }
  },

  Properties: function (props) {
    const item = props.item as RepeatData;
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          value={item.source.formula}
          onChange={val => props.setItem({ ...item, source: { formula: val } })}
          label={trans('source data')}
          id="Repeat-source"
          InputProps={inputFAdornment}
        />

        <InputApplyOnEnter
          component={TextField}
          value={item.varName}
          onChange={val => props.setItem({ ...item, varName: val })}
          label={trans('varName')}
          id="Repeat-varName"
        />

        <Typography color="GrayText">
          <small>{trans('repeat - current item is this var')}</small>
        </Typography>
        <Typography color="GrayText">
          <small>{trans('repeat - index name', [`${item.varName}_i`])}</small>
        </Typography>

        <TextField
          select
          label={trans('repeat - direction')}
          value={item.direction}
          onChange={e => props.setItem({ ...item, direction: e.target.value })}
          id="Repeat-direction"
        >
          {RepeatDirections.map(m => (
            <MenuItem key={m} value={m}>
              {trans(RepeatDirectionTrans[m])}
            </MenuItem>
          ))}
        </TextField>
      </>
    );
  },
};
