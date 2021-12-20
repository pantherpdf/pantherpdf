/**
 * Spacer.tsx
 */


import React from 'react'
import { TData, TDataCompiled, tuple } from '../types'
import type { Widget } from '../editor/types'
import { faArrowsAltV } from '@fortawesome/free-solid-svg-icons'
import PropertySlider from './PropertySlider';
import Trans from '../translation';
import BoxName from './BoxName';


export const TBorderStyles = tuple('dotted', 'dashed', 'solid');
export type TBorderStyle = (typeof TBorderStyles)[number];

interface Properties {
	height: number,
}
export type SpacerData = TData & Properties
export type SpacerCompiled = TDataCompiled & Properties


export const Spacer: Widget = {
	name: {en: 'Spacer', sl: 'Presledek'},
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
		return <BoxName {...props} name={Spacer.name}>
			<div style={{height: `${item.height}px`}} />
		</BoxName>
	},

	RenderFinal: function(props) {
		const item = props.item as SpacerCompiled
		return `<div style="height: ${item.height}px"></div>\n`
	},

	RenderProperties: function(props) {
		const item = props.item as SpacerData
		return <>
			<div className='hform'>
				<PropertySlider
					id='spacer-height'
					label={Trans('height')}
					min={3}
					max={300}
					value={item.height}
					onChange={val => props.setItem({...item, height: val})}
				/>
			</div>
		</>
	},
}
