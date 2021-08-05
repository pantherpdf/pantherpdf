/**
 * Repeat.tsx
 */

import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'


export interface RepeatData extends TData {
	type: 'Repeat',
	source: string,
	varName: string,
}

export interface RepeatCompiled extends TDataCompiled {
	type: 'Repeat',
}


export const Repeat: Widget = {
	name: {en: 'Repeat'},
	icon: {fontawesome: faEllipsisV},

	newItem: async (): Promise<RepeatData> => {
		return {
			type: 'Repeat',
			children: [],
			source: '',
			varName: '',
		}
	},

	compile: async (dt: RepeatData, helper): Promise<RepeatCompiled> => {
		const value = await helper.evalFormula(dt.formula)
		if (!Array.isArray(value)) {
			throw new Error('Repeating item is not array in Repeat widget')
		}
		const children: TDataCompiled[] = []
		for (const val2 of value) {
			helper.push(dt.varName, val2)
			const ch2 = await helper.compileChildren(dt.children)
			children.splice(children.length, 0, ...ch2)
			helper.pop()
		}
		return {
			type: dt.type,
			children,
		}
	},

	Render: function(props) {
		return <BoxName name={Repeat.name}>
			{props.item.children && props.renderWidgets(props.item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		return <div>{props.renderChildren(props.item.children, props)}</div>
	}
}