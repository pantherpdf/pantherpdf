/**
 * textSimple.tsx
 */


import React from 'react'
import { TData } from '../types'
import type { Widget, TDataCompiled } from '../editor/types'
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'


export interface TextSimpleData extends TData {
	type: 'textSimple',
	formula: string,
}

export interface TextSimpleCompiled extends TDataCompiled {
	type: 'textSimple',
	data: string,
}


export const textSimple: Widget = {
	name: {en: 'Text Simple'},
	icon: {fontawesome: faAlignLeft},

	newItem: async (): Promise<TextSimpleData> => {
		return {
			type: 'textSimple',
			children: [],
			formula: '',
		}
	},

	compile: async (dt: TextSimpleData, helpers): Promise<TextSimpleCompiled> => {
		return {
			data: await helpers.evalFormula(dt.formula),
			
			type: dt.type,
			children: await helpers.compileChildren(dt.children),
		}
	},

	Render: function(props) {
		const item = props.item as TextSimpleData
		return <BoxName name={'text'}>
			<div>{item.formula}</div>
		</BoxName>
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

	RenderFinal: function(props) {
		const data = props.item as TextSimpleCompiled
		return <div>{data.data}</div>
	},
}
