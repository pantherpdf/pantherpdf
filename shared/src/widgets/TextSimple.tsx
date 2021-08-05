/**
 * TextSimple.tsx
 */


import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'


export interface TextSimpleData extends TData {
	type: 'TextSimple',
	formula: string,
}

export interface TextSimpleCompiled extends TDataCompiled {
	type: 'TextSimple',
	data: string,
}


export const TextSimple: Widget = {
	name: {en: 'Text Simple'},
	icon: {fontawesome: faAlignLeft},

	newItem: async (): Promise<TextSimpleData> => {
		return {
			type: 'TextSimple',
			children: [],
			formula: '',
		}
	},

	compile: async (dt: TextSimpleData, helpers): Promise<TextSimpleCompiled> => {
		const str2 = await helpers.evalFormula(dt.formula)
		const str = (str2 !== undefined && str2 !== null && str2 !== false) ? String(str2) : ''
		return {
			type: dt.type,
			children: [],
			data: str,
		}
	},

	Render: function(props) {
		const item = props.item as TextSimpleData
		return <BoxName name={TextSimple.name}>
			<div>{item.formula}</div>
		</BoxName>
	},

	RenderFinal: function(props) {
		const item = props.item as TextSimpleCompiled
		return <div>{item.data}</div>
	},

	RenderProperties: function(props) {
		const item = props.item as TextSimpleData
		return <>
			<InputApplyOnEnter
				value={item.formula}
				onChange={val=>props.setItem({...item, formula: val})}
			/>
		</>
	},
}
