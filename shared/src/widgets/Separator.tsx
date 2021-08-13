/**
 * Separator.tsx
 */


import React, { CSSProperties } from 'react'
import { TData, TDataCompiled, tuple } from '../types'
import type { Widget } from '../editor/types'
import { faMinus } from '@fortawesome/free-solid-svg-icons'
import InputApplyOnEnter, { WidthRegex } from './InputApplyOnEnter'
import PropertyBorder, { Border, genBorderCss } from './PropertyBorder'
import Trans from '../translation'


export const TBorderStyles = tuple('dotted', 'dashed', 'solid');
export type TBorderStyle = (typeof TBorderStyles)[number];

interface Properties {
	marginTop: string,
	marginBottom: string,
	border: Border,
}
export type SeparatorData = TData & Properties
export type SeparatorCompiled = TDataCompiled & Properties


function GenStyle(item: SeparatorData | SeparatorCompiled): CSSProperties {
	return {
		marginTop: item.marginTop,
		marginBottom: item.marginBottom,
		borderTop: genBorderCss(item.border),
		borderRight: 'none',
		borderBottom: 'none',
		borderLeft: 'none',
		opacity: '1',
	}
}


export const Separator: Widget = {
	name: {en: 'Separator', sl: 'Črta'},
	icon: {fontawesome: faMinus},

	newItem: async (): Promise<SeparatorData> => {
		return {
			type: 'Separator',
			children: [],
			marginTop: '1rem',
			marginBottom: '1rem',
			border: {
				width: 1,
				style: 'solid',
				color: '#999999',
			},
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
			<label htmlFor='sep-marginTop' className='d-block'>
				{Trans('margin top')}
			</label>
			<InputApplyOnEnter
				id="sep-marginTop"
				value={item.marginTop}
				onChange={val => props.setItem({...props.item, marginTop: val})}
				regex={WidthRegex}
			/>

			<label htmlFor='sep-marginBottom' className='d-block'>
				{Trans('margin bottom')}
			</label>
			<InputApplyOnEnter
				id="sep-marginBottom"
				value={item.marginBottom}
				onChange={val => props.setItem({...props.item, marginBottom: val})}
				regex={WidthRegex}
			/>

			<PropertyBorder
				id='sep-border'
				value={item.border}
				onChange={val => props.setItem({...props.item, border: val})}
			/>
		</>
	},
}
