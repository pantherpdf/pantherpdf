/**
 * @file Filter array's items based on a condition
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import React from 'react';
import type { TransformItem, Transform } from './types';
import InputApplyOnEnter, {
  inputFAdornment,
} from '../components/InputApplyOnEnter';
import trans from '../translation';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import TextField from '@mui/material/TextField';
import { FormulaObject } from '../types';

export interface FilterData extends TransformItem {
  type: 'Filter';
  field: FormulaObject;
  condition: FormulaObject;
}

const Filter: Transform = {
  id: 'Filter',
  name: 'Filter',
  icon: faBars,

  newItem: async () => {
    const obj: FilterData = {
      type: 'Filter',
      comment: '',
      field: { formula: '' },
      condition: { formula: '' },
    };
    return obj;
  },

  transform: async (dt, item2, helper) => {
    const item = item2 as FilterData;
    if (
      item.field.formula.length === 0 ||
      item.condition.formula.length === 0
    ) {
      return dt;
    }
    helper.formulaHelper.push('data', dt);
    const result = await helper.evalFormula(item.field);
    if (!Array.isArray(result)) {
      throw new Error(`Expected field to be array but got ${result}`);
    }
    for (let i = 0; i < result.length; ) {
      helper.formulaHelper.push('item', result[i]);
      const result2 = await helper.evalFormula(item.condition);
      helper.formulaHelper.pop();
      if (result2) {
        // keep
        i += 1;
      } else {
        // remove
        result.splice(i, 1);
      }
    }
    helper.formulaHelper.pop();
    return dt;
  },

  Editor: function (props) {
    const item = props.item as FilterData;
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          value={item.field.formula}
          onChange={val => props.setItem({ ...item, field: { formula: val } })}
          label={trans('field')}
          id="trans-edit-field"
          InputProps={inputFAdornment}
        />

        <InputApplyOnEnter
          component={TextField}
          value={item.condition.formula}
          onChange={val =>
            props.setItem({ ...item, condition: { formula: val } })
          }
          label={trans('condition')}
          id="trans-edit-condition"
          InputProps={inputFAdornment}
          helperText={trans('current item is in var -name-', ['item'])}
        />
      </>
    );
  },
};

export { Filter };
