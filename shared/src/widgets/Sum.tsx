/**
 * Sum.tsx
 */

import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faDatabase, faPlusSquare } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'
import { findInList } from '../editor/childrenMgmt'


export interface VarContainerData extends TData {
	type: 'VarContainer',
	vars: {[key: string]: any},
}

export interface VarContainerCompiled extends TDataCompiled {
	type: 'VarContainer',
}


export const VarContainer: Widget = {
	name: {en: 'VarContainer SUM'},
	icon: {fontawesome: faDatabase},

	newItem: async (): Promise<VarContainerData> => {
		return {
			type: 'VarContainer',
			children: [],
			vars: [],
		}
	},

	compile: async (dt: VarContainerData, helper): Promise<VarContainerCompiled> => {
		for (const name of Object.keys(dt.vars)) {
			dt.vars[name] = 0
			helper.formulaHelper.push(name, (name2: string) => dt.vars[name2])
		}
		const children = await helper.compileChildren(dt.children, helper)
		for (const name of Object.keys(dt.vars)) {
			dt.vars[name] = 0
			helper.formulaHelper.pop()
		}
		return {
			type: dt.type,
			children,
		}
	},

	Render: function(props) {
		return <BoxName name={VarContainer.name}>
			{props.renderWidgets(props.item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		return <div>{props.renderChildren(props.item.children, props)}</div>
	},

	RenderProperties: function(props) {
		const item = props.item as VarContainerData
		return <>
			<div><label htmlFor='VarContainer-source'>
				Variables <span className='ms-2 text-muted'>comma separated</span>
			</label></div>
			<InputApplyOnEnter
				id='VarContainer-source'
				value={Object.keys(item.vars).join(', ')}
				onChange={val => {
					val = String(val)
					const vars = val
					.split(',')
					.map(v => v.trim())
					.filter(v => v.length > 0);
					const item2: VarContainerData = {...item, vars: {}}
					vars.map(v => item2.vars[v] = 0)
					props.setItem(item2)
				}}
			/>
		</>
	},
}









export interface SumData extends TData {
	type: 'Sum',
	varName: string,
	formula: string,
}

export interface SumCompiled extends TDataCompiled {
	type: 'Sum',
}


export const Sum: Widget = {
	name: {en: 'Sum'},
	icon: {fontawesome: faPlusSquare},

	newItem: async (): Promise<SumData> => {
		return {
			type: 'Sum',
			children: [],
			varName: '',
			formula: '',
		}
	},

	compile: async (dt: SumData, helper): Promise<SumCompiled> => {
		const value = await helper.evalFormula(dt.formula)
		// find container
		const wid2 = [...helper.wid]
		wid2.splice(wid2.length-1, 1)
		let found = false
		while (wid2.length > 0) {
			const parent1 = findInList(helper.report, wid2)
			if (parent1.type === 'VarContainer') {
				const parent2 = parent1 as VarContainerData
				if (dt.varName in parent2.vars) {
					parent2.vars[dt.varName] += value
					found = true
					break
				}
			}
			wid2.splice(wid2.length-1, 1)
		}
		if (!found) {
			throw new Error(`sum: variable (${dt.varName}) not found`)
		}
		return {
			type: dt.type,
			children: [],
		}
	},

	Render: function(props) {
		const item = props.item as SumData
		return <BoxName name={Sum.name}>
			<span className='text-muted'>
				{item.varName} += {item.formula}
			</span>
		</BoxName>
	},

	RenderFinal: function(props) {
		return null
	},

	RenderProperties: function(props) {
		//
		const vars: string[] = []
		const wid2 = [...props.wid]
		wid2.splice(wid2.length-1, 1)
		while (wid2.length > 0) {
			const parent1 = findInList(props.report, wid2)
			if (parent1.type === 'VarContainer') {
				const parent2 = parent1 as VarContainerData
				const vars2 = Object.keys(parent2.vars)
				for (const name of vars2) {
					if (vars.indexOf(name) === -1) {
						vars.push(name)
					}
				}
			}
			wid2.splice(wid2.length-1, 1)
		}
		//
		const item = props.item as SumData
		return <>
			<div><label htmlFor='Sum-source'>Source</label></div>
			<select
				className='form-select'
				value={item.varName}
				onChange={e => props.setItem({...item, varName: e.currentTarget.value})}
			>
				{vars.indexOf(item.varName) === -1 && <option value={item.varName}></option>}
				{vars.map(name => <option
					value={name}
					key={name}
				>
					{name}
				</option>)}
			</select>

			<div><label htmlFor='Sum-Formula'>Formula</label></div>
			<div className="input-group mb-3">
				<span className="input-group-text fst-italic">ƒ</span>
				<InputApplyOnEnter
					id='Sum-Formula'
					value={item.formula}
					onChange={val => props.setItem({...item, formula: val})}
				/>
			</div>
		</>
	},
}
