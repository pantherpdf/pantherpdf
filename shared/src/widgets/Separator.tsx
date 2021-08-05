/**
 * Separator.tsx
 */


import React, { CSSProperties } from 'react'
import { TData, TDataCompiled, tuple } from '../types'
import type { Widget } from '../editor/types'
import { faMinus } from '@fortawesome/free-solid-svg-icons'
import InputApplyOnEnter, { WidthRegex } from './InputApplyOnEnter'
import PropertyColor from './PropertyColor'


export const TBorderStyles = tuple('dotted', 'dashed', 'solid');
export type TBorderStyle = (typeof TBorderStyles)[number];

interface Properties {
	marginTop: string,
	marginBottom: string,
	width: string,
	style: TBorderStyle,
	color: string,
}
export type SeparatorData = TData & Properties
export type SeparatorCompiled = TDataCompiled & Properties


function GenStyle(item: SeparatorData | SeparatorCompiled): CSSProperties {
	return {
		marginTop: item.marginTop,
		marginBottom: item.marginBottom,
		border: 'none',
		borderTopWidth: item.width,
		borderTopStyle: item.style,
		borderTopColor: item.color,
	}
}


export const Separator: Widget = {
	name: {en: 'Separator'},
	icon: {fontawesome: faMinus},

	newItem: async (): Promise<SeparatorData> => {
		return {
			type: 'Separator',
			children: [],
			marginTop: '1rem',
			marginBottom: '1rem',
			width: '1px',
			style: 'solid',
			color: '#ccc',
		}
	},

	compile: async (dt: SeparatorData, helpers): Promise<SeparatorCompiled> => {
		return {
			...dt,
		}
	},

	Render: function(props) {
		const item = props.item as SeparatorData
		return <hr style={GenStyle(item)} />
	},

	RenderFinal: function(props) {
		const item = props.item as SeparatorCompiled
		return <hr style={GenStyle(item)} />
	},

	RenderProperties: function(props) {
		const item = props.item as SeparatorData
		return <>
			<label htmlFor='sep-marginTop'>Margin Top</label>
			<InputApplyOnEnter
				id="sep-marginTop"
				value={item.marginTop}
				onChange={val => props.setItem({...props.item, marginTop: val})}
				regex={WidthRegex}
			/>

			<label htmlFor='sep-marginBottom'>Margin Bottom</label>
			<InputApplyOnEnter
				id="sep-marginBottom"
				value={item.marginBottom}
				onChange={val => props.setItem({...props.item, marginBottom: val})}
				regex={WidthRegex}
			/>

			<label htmlFor='sep-width'>Width</label>
			<InputApplyOnEnter
				id="sep-width"
				value={item.width}
				onChange={val => props.setItem({...props.item, width: val})}
				regex={WidthRegex}
			/>

			<label htmlFor='sep-style'>Style</label>
			<select
				className=''
				value={item.style}
				onChange={e => props.setItem({...props.item, style: e.currentTarget.value})}
			>
				{TBorderStyles.map(s => <option
					value={s}
					key={s}
				>
					{s}
				</option>)}
			</select>

			<PropertyColor
				value={item.color}
				onChange={val => props.setItem({...props.item, color: val})}
			/>
		</>
	},
}
