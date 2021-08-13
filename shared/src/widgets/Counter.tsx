/**
 * counter.tsx
 */


import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faStopwatch } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import Trans, { TransName } from '../translation'
import InputApplyOnEnter from './InputApplyOnEnter'


export interface CounterData extends TData {
	type: 'Counter',
	varName: string,
}

export interface CounterCompiled extends TDataCompiled {
}


export const Counter: Widget = {
	name: {en: 'Counter', sl: 'Števec'},
	icon: {fontawesome: faStopwatch},

	newItem: async (): Promise<CounterData> => {
		return {
			type: 'Counter',
			children: [],
			varName: 'counter1',
		}
	},

	compile: async (dt: CounterData, helper): Promise<CounterCompiled> => {
		let id = 0
		helper.formulaHelper.push(dt.varName, () => { return id++ })
		const children = await helper.compileChildren(dt.children, helper)
		helper.formulaHelper.pop()
		return {
			type: dt.type,
			children,
		}
	},

	Render: function(props) {
		const item = props.item as CounterData
		return <BoxName {...props} name={`${TransName(Counter.name)}: ${item.varName}`}>
			{props.renderWidgets(props.item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		return <>
			{props.renderChildren(props.item.children, props)}
		</>
	},

	RenderProperties: function(props) {
		const item = props.item as CounterData
		return <>
			<label htmlFor='counter-varName' className='d-block'>
				{Trans('varName')}
			</label>
			<small className='text-muted d-block'>
				{Trans('counter - current count var')}
				<br />
				{Trans('counter - var increment access')}
			</small>
			<InputApplyOnEnter
				value={item.varName}
				id='counter-varName'
				onChange={val=>props.setItem({...item, varName: val})}
			/>
		</>
	},
}
