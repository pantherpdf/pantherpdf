/**
 * Separator.tsx
 */


import React, { CSSProperties } from 'react'
import { TData, TDataCompiled, tuple } from '../types'
import type { Widget } from '../editor/types'
import { faMinus } from '@fortawesome/free-solid-svg-icons'
import PropertyBorder, { Border, genBorderCss } from './PropertyBorder'
import Trans from '../translation'
import BoxName from './BoxName'


export const TBorderStyles = tuple('dotted', 'dashed', 'solid');
export type TBorderStyle = (typeof TBorderStyles)[number];

interface Properties {
	marginTop: number,
	marginBottom: number,
	border: Border,
}
export type SeparatorData = TData & Properties
export type SeparatorCompiled = TDataCompiled & Properties


function GenStyle(item: SeparatorData | SeparatorCompiled): CSSProperties {
	return {
		marginTop: `${item.marginTop}px`,
		marginBottom: `${item.marginBottom}px`,
		borderTop: genBorderCss(item.border),
		borderRight: 'none',
		borderBottom: 'none',
		borderLeft: 'none',
		opacity: '1',
		color: 'transparent',
	}
}


export const Separator: Widget = {
	name: {en: 'Separator', sl: 'Črta'},
	icon: {fontawesome: faMinus},

	newItem: async (): Promise<SeparatorData> => {
		return {
			type: 'Separator',
			children: [],
			marginTop: 20,
			marginBottom: 20,
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
		return <BoxName {...props} name={Separator.name}>
			<hr style={GenStyle(item)} />
		</BoxName>
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
				<small className='ms-2 text-muted'>
					{item.marginTop}px
				</small>
			</label>
			<input
				type='range'
				id='sep-marginTop'
				min={0}
				max={40}
				value={item.marginTop}
				onChange={e => props.setItem({...props.item, marginTop: parseFloat(e.currentTarget.value)})}
				className='form-range'
			/>

			<label htmlFor='sep-marginBottom' className='d-block'>
				{Trans('margin bottom')}
				<small className='ms-2 text-muted'>
					{item.marginBottom}px
				</small>
			</label>
			<input
				type='range'
				id='sep-marginBottom'
				min={0}
				max={40}
				value={item.marginBottom}
				onChange={e => props.setItem({...props.item, marginBottom: parseFloat(e.currentTarget.value)})}
				className='form-range'
			/>

			<PropertyBorder
				id='sep-border'
				value={item.border}
				onChange={val => props.setItem({...props.item, border: val})}
			/>
		</>
	},
}
