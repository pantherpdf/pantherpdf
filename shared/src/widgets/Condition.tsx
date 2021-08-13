/**
 * Condition.tsx
 */


import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'
import Trans from '../translation'


export interface ConditionData extends TData {
	type: 'Condition',
	formula: string,
}

export interface ConditionCompiled extends TDataCompiled {
	type: 'Condition',
}


export const Condition: Widget = {
	name: {en: 'Condition', sl: 'Pogoj'},
	icon: {fontawesome: faCodeBranch},

	newItem: async (): Promise<ConditionData> => {
		return {
			type: 'Condition',
			children: [],
			formula: 'true',
		}
	},

	compile: async (dt: ConditionData, helper): Promise<ConditionCompiled> => {
		const ok = await helper.evalFormula(dt.formula)
		return {
			type: dt.type,
			children: ok ? await helper.compileChildren(dt.children, helper) : [],
		}
	},

	Render: function(props) {
		const item = props.item as ConditionData
		return <BoxName {...props} name={Condition.name}>
			{props.renderWidgets(item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		const item = props.item as ConditionCompiled
		return <>
			{props.renderChildren(item.children, props)}
		</>
	},

	RenderProperties: function(props) {
		const item = props.item as ConditionData
		return <>
			<label htmlFor='Condition-formula'>
				{Trans('formula')}
			</label>
			<div className="input-group mb-3">
				<span className="input-group-text fst-italic">ƒ</span>
				<InputApplyOnEnter
					id='Condition-formula'
					value={item.formula}
					onChange={val=>props.setItem({...item, formula: val})}
				/>
			</div>
		</>
	},
}
 