/**
 * filter.tsx
 * filter array's items based on a condition
 */


import React from 'react'
import { TTransformData } from '../types'
import { TTransformWidget } from '../editor/types'
import { IHelpers } from '../formula/types'
import FormulaEvaluate from '../formula/formula'
import InputApplyOnEnter from '../widgets/InputApplyOnEnter'
import Trans from '../translation'

export interface FilterData extends TTransformData {
	type: 'filter',
	field: string,
}

const filter: TTransformWidget = {
	name: 'Filter',

	newItem: async () => {
		const obj: FilterData = {
			type: 'filter',
			comment: '',
			field: '',
			condition: '',
		}
		return obj
	},
	
	transform: async (dt, item2: TTransformData) => {
		const item = item2 as FilterData
		if (item.field.length === 0 || item.condition.length === 0)
			return dt
		const helper: IHelpers & {vars: {}} = {
			vars: {
				'_': dt,
			}
		}
		const result = await FormulaEvaluate(item.field, helper)
		if (!Array.isArray(result))
			throw new Error('')
		for (let i=0; i<result.length;) {
			helper.vars['item'] = result[i]
			const result2 = await FormulaEvaluate(item.condition, helper)
			if (result2) {
				// keep
				i += 1
			}
			else {
				// remove
				result.splice(i, 1)
			}
		}
		return dt
	},
	
	Editor: function(props) {
		const item = props.item as FilterData
		return <>
			<label htmlFor='trans-edit-field'>{Trans('field')}</label>
			<div className="input-group mb-3">
				<span className="input-group-text fst-italic">ƒ</span>
				<InputApplyOnEnter id='trans-edit-field' value={item.field} onChange={val=>props.setItem({...item, field: val})} />
			</div>

			<label htmlFor='trans-edit-condition'>
				{Trans('condition')}
				<small><span className='ms-2 text-muted'>Use variable: <span className='font-monospace'>item</span></span></small>
			</label>
			<div className="input-group mb-3">
				<span className="input-group-text fst-italic">ƒ</span>
				<InputApplyOnEnter id='trans-edit-condition' value={item.condition} onChange={val=>props.setItem({...item, condition: val})} />
			</div>
		</>
	},
}

export { filter }
