/**
 * counter.tsx
 */


import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import { TransName } from '../translation'
import InputApplyOnEnter from './InputApplyOnEnter'


export interface CounterData extends TData {
	type: 'Counter',
	varName: string,
}

export interface CounterCompiled extends TDataCompiled {
}


export const Counter: Widget = {
	name: {en: 'Counter'},
	icon: {fontawesome: faAlignLeft},

	newItem: async (): Promise<CounterData> => {
		return {
			type: 'Counter',
			children: [],
			varName: 'counter1',
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
		const item = props.item as CounterData
		return <BoxName name={`${TransName(Counter.name)}: ${item.varName}`}>
			{props.renderWidgets(props.item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		return <div>
			{props.renderChildren(props.item.children, props)}
		</div>
	},

	RenderProperties: function(props) {
		const item = props.item as CounterData
		return <>
			<div>
				<label htmlFor='counter-varName'>Variable name</label>
				<br />
				<small className='text-muted'>
					where current count will be saved
					<br />
					variable will be incremented each time it is accessed
				</small>
			</div>
			<InputApplyOnEnter
				value={item.varName}
				id='counter-varName'
				onChange={val=>props.setItem({...item, varName: val})}
			/>
		</>
	},
}
