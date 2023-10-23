/**
 * @file Filter array's items based on a condition
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React from 'react';
import { TransformItem } from '../types';
import { Transform } from '../editor/types';
import { IHelpers } from '../formula/types';
import FormulaEvaluate from '../formula/formula';
import InputApplyOnEnter from '../widgets/InputApplyOnEnter';
import Trans from '../translation';
import globalStyle from '../globalStyle.module.css';

export interface FilterData extends TransformItem {
  type: 'Filter';
  field: string;
  condition: string;
}

const Filter: Transform = {
  id: 'Filter',
  name: 'Filter',

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
        <div className={globalStyle.hform}>
          <label htmlFor="trans-edit-field">{Trans('field')}</label>
          <div className="input-group mb-3">
            <span className="input-group-text fst-italic">ƒ</span>
            <InputApplyOnEnter
              id="trans-edit-field"
              value={item.field}
              onChange={val => props.setItem({ ...item, field: val })}
            />
          </div>
        </div>

        <div className={`${globalStyle.hform} mb-0`}>
          <label htmlFor="trans-edit-condition">{Trans('condition')}</label>
          <div className="input-group">
            <span className="input-group-text fst-italic">ƒ</span>
            <InputApplyOnEnter
              id="trans-edit-condition"
              value={item.condition}
              onChange={val => props.setItem({ ...item, condition: val })}
            />
          </div>
        </div>
        <small className="text-muted mb-3">
          {Trans('current item is in var -name-', ['item'])}
        </small>
      </>
    );
  },
};

export { Filter };
