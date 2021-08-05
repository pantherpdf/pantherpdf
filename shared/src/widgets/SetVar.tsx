/**
 * SetVar.tsx
 */

import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faHammer } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'
import { TransName } from '../translation'


export interface SetVarData extends TData {
	type: 'SetVar',
	source: string,
	varName: string,
}

export interface SetVarCompiled extends TDataCompiled {
	type: 'SetVar',
}


export const SetVar: Widget = {
	name: {en: 'SetVar'},
	icon: {fontawesome: faHammer},

	newItem: async (): Promise<SetVarData> => {
		return {
			type: 'SetVar',
			children: [],
			source: '',
			varName: '',
		}
	},

	compile: async (dt: SetVarData, helper): Promise<SetVarCompiled> => {
		const value = await helper.evalFormula(dt.source)
		helper.push(dt.varName, value)
		const children = await helper.compileChildren(dt.children)
		helper.pop()
		return {
			type: dt.type,
			children,
		}
	},

	Render: function(props) {
		const item = props.item as SetVarData
		return <BoxName name={`${TransName(SetVar.name)} - ${item.varName}`}>
			{props.renderWidgets(props.item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		return <div>{props.renderChildren(props.item.children, props)}</div>
	},

	RenderProperties: function(props) {
		const item = props.item as SetVarData
		return <>
			<div><label htmlFor='SetVar-source'>Source</label></div>
			<div className="input-group mb-3">
				<span className="input-group-text fst-italic">ƒ</span>
				<InputApplyOnEnter
					id='SetVar-source'
					value={item.array}
					onChange={val=>props.setItem({...item, array: val})}
				/>
			</div>

			<div>
				<label htmlFor='SetVar-varName'>Var name</label>
				<br />
				selected item will be in this variable
			</div>
			<InputApplyOnEnter
				id='SetVar-varName'
				value={item.varName}
				onChange={val=>props.setItem({...item, varName: val})}
			/>
		</>
	},
}
