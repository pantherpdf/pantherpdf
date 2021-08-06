/**
 * FirstMatch.tsx
 */


import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faHandRock } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'
import { TransName } from '../translation'


export interface FirstMatchData extends TData {
	type: 'FirstMatch',
	source: string,
	condition: string,
	varName: string,
}

export interface FirstMatchCompiled extends TDataCompiled {
	type: 'FirstMatch',
}


export const FirstMatch: Widget = {
	name: {en: 'FirstMatch'},
	icon: {fontawesome: faHandRock},

	newItem: async (): Promise<FirstMatchData> => {
		return {
			type: 'FirstMatch',
			children: [],
			source: '[]',
			condition: 'true',
			varName: 'match1',
		}
	},

	compile: async (dt: FirstMatchData, helper): Promise<FirstMatchCompiled> => {
		const arr = await helper.evalFormula(dt.source)
		if (!Array.isArray(arr)) {
			throw new Error(`FirstMatch: source should be array bot got ${typeof arr}`)
		}
		let obj
		let found = false
		for (const itm of arr) {
			helper.formulaHelper.push(dt.varName, itm)
			const xx = await helper.evalFormula(dt.condition)
			helper.formulaHelper.pop()
			if (xx) {
				obj = itm
				found = true
				break
			}
		}
		helper.formulaHelper.push(dt.varName, obj)
		const result: FirstMatchCompiled = {
			type: dt.type,
			children: found ? await helper.compileChildren(dt.children, helper) : [],
		}
		helper.formulaHelper.pop()
		return result
	},

	Render: function(props) {
		const item = props.item as FirstMatchData
		return <BoxName name={`${TransName(FirstMatch.name)}: ${item.varName}`}>
			{props.renderWidgets(item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		const item = props.item as FirstMatchCompiled
		return <div>
			{props.renderChildren(item.children, props)}
		</div>
	},

	RenderProperties: function(props) {
		const item = props.item as FirstMatchData
		return <>
			<label htmlFor='FirstMatch-source'>Source</label>
			<div className="input-group mb-3">
				<span className="input-group-text fst-italic">ƒ</span>
				<InputApplyOnEnter
					id='FirstMatch-source'
					value={item.source}
					onChange={val=>props.setItem({...item, source: val})}
				/>
			</div>

			<div>
				<label htmlFor='FirstMatch-condition'>Condition</label>
				<br />
				current item is in variable: <span style={{fontFamily:'monospace'}}>{item.varName}</span>
			</div>
			<div className="input-group mb-3">
				<span className="input-group-text fst-italic">ƒ</span>
				<InputApplyOnEnter
					id='FirstMatch-condition'
					value={item.condition}
					onChange={val=>props.setItem({...item, condition: val})}
				/>
			</div>

			<div>
				<label htmlFor='FirstMatch-varName'>Var name</label>
				<br />
				selected item will be in this variable
			</div>
			<InputApplyOnEnter
				id='FirstMatch-varName'
				value={item.varName}
				onChange={val=>props.setItem({...item, varName: val})}
			/>
		</>
	},
}
