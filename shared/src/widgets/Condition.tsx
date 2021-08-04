/**
 * Condition.tsx
 */


import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'


export interface ConditionData extends TData {
	type: 'Condition',
	formula: string,
}

export interface ConditionCompiled extends TDataCompiled {
	type: 'Condition',
}


export const Condition: Widget = {
	name: {en: 'Condition'},
	icon: {fontawesome: faCodeBranch},

	newItem: async (): Promise<ConditionData> => {
		return {
			type: 'Condition',
			children: [],
			formula: 'true',
		}
	},

	compile: async (dt: ConditionData, helpers): Promise<ConditionCompiled> => {
		const ok = await helpers.evalFormula(dt.formula)
		return {
			type: dt.type,
			children: ok ? await helpers.compileChildren(dt.children) : [],
		}
	},

	Render: function(props) {
		const item = props.item as ConditionData
		return <BoxName name={Condition.name}>
			{props.renderWidgets(item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		const item = props.item as ConditionCompiled
		return <div>
			{props.renderChildren(item.children, props)}
		</div>
	},

	RenderProperties: function(props) {
		const item = props.item as ConditionData
		return <>
			<InputApplyOnEnter
				value={item.formula}
				onChange={val=>props.setItem({...item, formula: val})}
			/>
		</>
	},
}
 