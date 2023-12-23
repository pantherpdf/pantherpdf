/**
 * @file Filter array's items based on a condition
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import type { TransformItem, Transform } from './types';
import type { IHelpers } from '../formula/types';
import FormulaEvaluate from '../formula/formula';
import InputApplyOnEnter, {
  inputFAdornment,
} from '../widgets/InputApplyOnEnter';
import Trans from '../translation';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import TextField from '@mui/material/TextField';

export interface FilterData extends TransformItem {
  type: 'Filter';
  field: string;
  condition: string;
}

const Filter: Transform = {
  id: 'Filter',
  name: 'Filter',
  icon: faBars,

  newItem: async () => {
    const obj: FilterData = {
      type: 'Filter',
      comment: '',
      field: '',
      condition: '',
    };
    return obj;
  },

  transform: async (dt, item2: TransformItem) => {
    const item = item2 as FilterData;
    if (item.field.length === 0 || item.condition.length === 0) {
      return dt;
    }
    const helper: IHelpers & { vars: {} } = {
      vars: {
        data: dt,
      },
    };
    const result = await FormulaEvaluate(item.field, helper);
    if (!Array.isArray(result)) {
      throw new Error('');
    }
    for (let i = 0; i < result.length; ) {
      helper.vars['item'] = result[i];
      const result2 = await FormulaEvaluate(item.condition, helper);
      if (result2) {
        // keep
        i += 1;
      } else {
        // remove
        result.splice(i, 1);
      }
    }
    return dt;
  },

  RenderEditor: function (props) {
    const item = props.item as FilterData;
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          value={item.field}
          onChange={val => props.setItem({ ...item, field: val })}
          label={Trans('field')}
          id="trans-edit-field"
          InputProps={inputFAdornment}
        />

        <InputApplyOnEnter
          component={TextField}
          value={item.condition}
          onChange={val => props.setItem({ ...item, condition: val })}
          label={Trans('condition')}
          id="trans-edit-condition"
          InputProps={inputFAdornment}
          helperText={Trans('current item is in var -name-', ['item'])}
        />
      </>
    );
  },
};

export { Filter };
