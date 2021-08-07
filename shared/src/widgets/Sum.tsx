/**
 * Sum.tsx
 */

import React from 'react'
import { TData, TDataCompiled, TReport } from '../types'
import type { Widget } from '../editor/types'
import { faDatabase, faPlusSquare } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'
import { findInList } from '../editor/childrenMgmt'
import { TransName } from '../translation'


export interface VarContainerData extends TData {
	type: 'VarContainer',
	vars: {[key: string]: any},
}

export interface VarContainerCompiled extends TDataCompiled {
	type: 'VarContainer',
}


export const VarContainer: Widget = {
	name: {en: 'VarContainer'},
	icon: {fontawesome: faDatabase},

	newItem: async (): Promise<VarContainerData> => {
		return {
			type: 'VarContainer',
			children: [],
			vars: {'var1': 0},
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
		const item = props.item as VarContainerData
		return <BoxName name={`${TransName(VarContainer.name)} - ${Object.keys(item.vars).join(', ')}`}>
			{props.renderWidgets(props.item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		return <>
			{props.renderChildren(props.item.children, props)}
		</>
	},

	RenderProperties: function(props) {
		const item = props.item as VarContainerData
		return <>
			<div><label htmlFor='VarContainer-vars'>
				Variables <span className='ms-2 text-muted'>comma separated</span>
			</label></div>
			<InputApplyOnEnter
				id='VarContainer-vars'
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







function getParentContainers(report: TReport, wid: number[]): VarContainerData[] {
	if (wid.length === 0) {
		return []
	}
	wid = [...wid]
	wid.splice(wid.length-1, 1)
	const arr: VarContainerData[] = []
	while (wid.length > 0) {
		const parent1 = findInList(report, wid)
		if (parent1.type === 'VarContainer') {
			const parent2 = parent1 as VarContainerData
			arr.push(parent2)
		}
		wid.splice(wid.length-1, 1)
	}
	return arr
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
		const parents = getParentContainers(helper.report, helper.wid)
		for (const prnt of parents) {
			if (dt.varName in prnt.vars) {
				prnt.vars[dt.varName] += value
				found = true
				break
			}
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
		function Impl() {
			const parents = getParentContainers(props.report, props.wid)
			if (parents.length === 0) {
				return <span className='text-danger'>
					Error: Missing VarContainer
				</span>
			}
			if (item.varName.length === 0) {
				return <span className='text-danger'>
					Error: variable not selected
				</span>
			}
			const varExists = !!parents.find(x => item.varName in x.vars)
			if (!varExists) {
				return <span className='text-danger'>
					Error: variable does not exist in parent VarContainer(s)
				</span>
			}
			return (
				<span className='text-muted fst-italic font-monospace' style={{fontSize: '9px'}}>
					{item.varName} += {item.formula}
				</span>
			)
		}

		return <BoxName name={Sum.name}>
			<Impl />
		</BoxName>
	},

	RenderFinal: function(props) {
		return null
	},

	RenderProperties: function(props) {
		//
		const vars: string[] = []
		const parents = getParentContainers(props.report, props.wid)
		for (const prt of parents) {
			const vars2 = Object.keys(prt.vars)
			for (const name of vars2) {
				if (vars.indexOf(name) === -1) {
					vars.push(name)
				}
			}
		}
		//
		const item = props.item as SumData
		return <>
			<div>
				<label htmlFor='Sum-varName'>Variable Name</label>
			</div>
			<select
				className='form-select'
				value={item.varName}
				onChange={e => props.setItem({...item, varName: e.currentTarget.value})}
				id='Sum-varName'
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
