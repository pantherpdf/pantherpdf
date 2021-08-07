/**
 * Repeat.tsx
 */

import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'
import { TransName } from '../translation'


export interface RepeatData extends TData {
	type: 'Repeat',
	source: string,
	varName: string,
}

export interface RepeatCompiled extends TDataCompiled {
	type: 'Repeat',
}


export const Repeat: Widget = {
	name: {en: 'Repeat'},
	icon: {fontawesome: faEllipsisV},

	newItem: async (): Promise<RepeatData> => {
		return {
			type: 'Repeat',
			children: [],
			source: '',
			varName: '',
		}
	},

	compile: async (dt: RepeatData, helper): Promise<RepeatCompiled> => {
		const value = await helper.evalFormula(dt.source)
		if (!Array.isArray(value)) {
			throw new Error(`Repeat: expected source to be array but got ${typeof value}`)
		}
		const children: TDataCompiled[] = []
		for (const val2 of value) {
			helper.formulaHelper.push(dt.varName, val2)
			const ch2 = await helper.compileChildren(dt.children, helper)
			children.splice(children.length, 0, ...ch2)
			helper.formulaHelper.pop()
		}
		return {
			type: dt.type,
			children,
		}
	},

	Render: function(props) {
		const item = props.item as RepeatData
		return <BoxName {...props} name={`${TransName(Repeat.name)} - ${item.varName}`}>
			{props.item.children && props.renderWidgets(props.item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		return <>
			{props.renderChildren(props.item.children, props)}
		</>
	},

	RenderProperties: function(props) {
		const item = props.item as RepeatData
		return <>
			<div><label htmlFor='Repeat-source'>Source</label></div>
			<div className="input-group mb-3">
				<span className="input-group-text fst-italic">ƒ</span>
				<InputApplyOnEnter
					id='Repeat-source'
					value={item.source}
					onChange={val=>props.setItem({...item, source: val})}
				/>
			</div>

			<div>
				<label htmlFor='Repeat-varName'>Var name</label>
				<br />
				selected item will be in this variable
			</div>
			<InputApplyOnEnter
				id='Repeat-varName'
				value={item.varName}
				onChange={val=>props.setItem({...item, varName: val})}
			/>
		</>
	},
}
