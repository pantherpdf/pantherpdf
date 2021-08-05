/**
 * Html.tsx
 * Render html
 */


import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'


export interface HtmlData extends TData {
	type: 'Html',
	formula: string,
}

export interface HtmlCompiled extends TDataCompiled {
	type: 'Html',
	data: string,
}


export const Html: Widget = {
	name: {en: 'Html'},
	icon: {fontawesome: faAlignLeft},

	newItem: async (): Promise<HtmlData> => {
		return {
			type: 'Html',
			children: [],
			formula: '',
		}
	},

	compile: async (dt: HtmlData, helpers): Promise<HtmlCompiled> => {
		const str2 = await helpers.evalFormula(dt.formula)
		const str = (str2 !== undefined && str2 !== null && str2 !== false) ? String(str2) : ''
		return {
			type: dt.type,
			children: [],
			data: str,
		}
	},

	Render: function(props) {
		const item = props.item as HtmlData
		return <BoxName name={Html.name}>
			<div className='font-monospace'>
				{item.formula}
			</div>
		</BoxName>
	},

	RenderFinal: function(props) {
		const item = props.item as HtmlCompiled
		return <div
			dangerouslySetInnerHTML={{__html: item.data}}
		/>
	},

	RenderProperties: function(props) {
		const item = props.item as HtmlData
		return <>
			<InputApplyOnEnter
				value={item.formula}
				onChange={val=>props.setItem({...item, formula: val})}
			/>
		</>
	},
}
