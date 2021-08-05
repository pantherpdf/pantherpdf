/**
 * Html.tsx
 * Render html
 */


import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faCode } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'


export interface HtmlData extends TData {
	type: 'Html',
	source: string,
}

export interface HtmlCompiled extends TDataCompiled {
	type: 'Html',
	data: string,
}


export const Html: Widget = {
	name: {en: 'Html'},
	icon: {fontawesome: faCode},

	newItem: async (): Promise<HtmlData> => {
		return {
			type: 'Html',
			children: [],
			source: '',
		}
	},

	compile: async (dt: HtmlData, helpers): Promise<HtmlCompiled> => {
		const str2 = await helpers.evalFormula(dt.source)
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
				{item.source}
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
			<div className="input-group mb-3">
				<span className="input-group-text fst-italic">ƒ</span>
				<InputApplyOnEnter
					value={item.source}
					onChange={val=>props.setItem({...item, source: val})}
				/>
			</div>
		</>
	},
}
