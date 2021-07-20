/**
 * counter.tsx
 */


import React from 'react'
import type { Widget, TData, TDataCompiled } from '../editor/types'
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'


export interface CounterData extends TData {
	type: 'counter',
	varName: string,
}

export interface CounterCompiled extends TDataCompiled {
}


export const counter: Widget = {
	name: {en: 'Counter'},
	icon: {fontawesome: faAlignLeft},

	newItem: async (): Promise<CounterData> => {
		return {
			type: 'counter',
			children: [],
			varName: '',
		}
	},

	compile: async (dt: CounterData, helpers): Promise<CounterCompiled> => {
		let id = 0
		helpers.push(dt.varName, () => { return id++ })
		const children = await helpers.compileChildren(dt.children)
		helpers.pop()
		return {
			type: dt.type,
			children,
		}
	},

	Render: function(props) {
		return <BoxName name={counter.name} preview={false} className={''}>
			{props.item.children && props.renderWidgets(props.item.children, props.wid)}
		</BoxName>
	},
}
