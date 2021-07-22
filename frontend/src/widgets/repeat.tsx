/**
 * repeat.tsx
 */

import React from 'react'
import { TData } from '../../../backend/shared/types'
import type { Widget, TDataCompiled } from '../editor/types'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'


export interface RepeatData extends TData {
	type: 'repeat',
	formula: string,
	varName: string,
}

export interface RepeatCompiled extends TDataCompiled {
	type: 'repeat',
}


export const repeat: Widget = {
	name: {en: 'Repeat'},
	icon: {fontawesome: faEllipsisV},

	newItem: async (): Promise<RepeatData> => {
		return {
			type: 'repeat',
			children: [],
			formula: '',
			varName: '',
		}
	},

	compile: async (dt: RepeatData, helper): Promise<RepeatCompiled> => {
		const value = await helper.evalFormula(dt.formula)
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
		return <BoxName name={repeat.name} preview={false} className={''}>
			{props.item.children && props.renderWidgets(props.item.children, props.wid)}
		</BoxName>
	},
}