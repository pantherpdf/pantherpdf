/**
 * SetVar.tsx
 */

import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faHammer } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'
import Trans, { TransName } from '../translation'


export interface SetVarData extends TData {
	type: 'SetVar',
	source: string,
	varName: string,
}

export interface SetVarCompiled extends TDataCompiled {
	type: 'SetVar',
}


export const SetVar: Widget = {
	name: {en: 'SetVar', sl: 'Spremenljivka'},
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
		helper.formulaHelper.push(dt.varName, value)
		const children = await helper.compileChildren(dt.children, helper)
		helper.formulaHelper.pop()
		return {
			type: dt.type,
			children,
		}
	},

	Render: function(props) {
		const item = props.item as SetVarData
		return <BoxName {...props} name={`${TransName(SetVar.name)} - ${item.varName}`}>
			{props.renderWidgets(props.item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		return <>
			{props.renderChildren(props.item.children, props)}
		</>
	},

	RenderProperties: function(props) {
		const item = props.item as SetVarData
		return <>
			<label htmlFor='SetVar-source' className='d-block'>
				{Trans('source data')}
			</label>
			<div className="input-group mb-3">
				<span className="input-group-text fst-italic">ƒ</span>
				<InputApplyOnEnter
					id='SetVar-source'
					value={item.source}
					onChange={val=>props.setItem({...item, source: val})}
				/>
			</div>

			<label htmlFor='SetVar-varName' className='d-block'>
				{Trans('varName')}
			</label>
			<small className='text-muted d-block'>
				{Trans('repeat - current item is this var')}
			</small>
			<InputApplyOnEnter
				id='SetVar-varName'
				value={item.varName}
				onChange={val=>props.setItem({...item, varName: val})}
			/>
		</>
	},
}
