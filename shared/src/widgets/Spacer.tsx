/**
 * Spacer.tsx
 */


import React from 'react'
import { TData, TDataCompiled, tuple } from '../types'
import type { Widget } from '../editor/types'
import { faArrowsAltV } from '@fortawesome/free-solid-svg-icons'
import PropertySlider from './PropertySlider';


export const TBorderStyles = tuple('dotted', 'dashed', 'solid');
export type TBorderStyle = (typeof TBorderStyles)[number];

interface Properties {
	height: number,
}
export type SpacerData = TData & Properties
export type SpacerCompiled = TDataCompiled & Properties


export const Spacer: Widget = {
	name: {en: 'Spacer'},
	icon: {fontawesome: faArrowsAltV},

	newItem: async (): Promise<SpacerData> => {
		return {
			type: 'Spacer',
			children: [],
			height: 50,
		}
	},

	compile: async (dt: SpacerData, helpers): Promise<SpacerCompiled> => {
		return {
			...dt,
		}
	},

	Render: function(props) {
		const item = props.item as SpacerData
		return <div style={{height: `${item.height}px`}} />
	},

	RenderFinal: function(props) {
		const item = props.item as SpacerCompiled
		return <div style={{height: `${item.height}px`}} />
	},

	RenderProperties: function(props) {
		const item = props.item as SpacerData
		return <>
			<div>
				<label htmlFor='spacer-height'>Height</label>
			</div>
			<PropertySlider
				min={3}
				max={300}
				value={item.height}
				onChange={val => props.setItem({...item, height: val})}
			/>
		</>
	},
}