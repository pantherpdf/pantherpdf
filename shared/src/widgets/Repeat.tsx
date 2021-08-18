/**
 * Repeat.tsx
 */

import React, { CSSProperties } from 'react'
import { TData, TDataCompiled, tuple } from '../types'
import type { Widget } from '../editor/types'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter from './InputApplyOnEnter'
import Trans, { TransName, trKeys } from '../translation'


const RepeatDirections = tuple('rows', 'columns', 'grid');
type RepeatDirection = (typeof RepeatDirections)[number];
const RepeatDirectionTrans: {[key in RepeatDirection]: trKeys} = {
	rows: 'repeat - direction rows',
	columns: 'repeat - direction columns',
	grid: 'repeat - direction grid',
}

export interface RepeatData extends TData {
	type: 'Repeat',
	source: string,
	varName: string,
	direction: RepeatDirection,
}

export interface RepeatCompiled extends TDataCompiled {
	type: 'Repeat',
	children: TDataCompiled[][],
	direction: RepeatDirection,
}


export const Repeat: Widget = {
	name: {en: 'Repeat', sl: 'Ponavljaj'},
	icon: {fontawesome: faEllipsisV},

	newItem: async (): Promise<RepeatData> => {
		return {
			type: 'Repeat',
			children: [],
			source: '',
			varName: 'item',
			direction: 'rows',
		}
	},

	compile: async (dt: RepeatData, helper): Promise<RepeatCompiled> => {
		const value = await helper.evalFormula(dt.source)
		if (!Array.isArray(value)) {
			throw new Error(`Repeat: expected source to be array but got ${typeof value}`)
		}
		const children: TDataCompiled[][] = []
		for (const val2 of value) {
			helper.formulaHelper.push(dt.varName, val2)
			const ch2 = await helper.compileChildren(dt.children, helper)
			children.push(ch2)
			helper.formulaHelper.pop()
		}
		return {
			type: dt.type,
			children,
			direction: dt.direction,
		}
	},

	Render: function(props) {
		const item = props.item as RepeatData
		return <BoxName {...props} name={`${TransName(Repeat.name)} - ${item.varName}`}>
			{props.item.children && props.renderWidgets(props.item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		const item = props.item as RepeatCompiled
		if (item.direction === 'rows') {
			// maybe add to cssItem:
			// pageBreakInside: 'avoid',  // must be present otherwise item in quotes gets breaked up
			return <>
				{props.renderChildren(props.item.children, props)}
			</>
		}
		const cssParent: CSSProperties = {}
		const cssItem: CSSProperties = {}
		if (item.direction === 'columns') {
			cssParent.display = 'flex'
			const w = item.children.length > 0 ? 1 / item.children.length : 1
			cssItem.flex = `0 0 ${w.toFixed(1)}%`
		}
		if (item.direction === 'grid') {
			cssParent.display = 'flex'
			cssParent.flexWrap = 'wrap'
		}
		// maybe remove <div> when only one child and this child is frame?
		return <div style={cssParent}>
			{item.children.map((item, idx) => <div
				key={idx}
				style={cssItem}
			>
				{props.renderChildren(item, props)}
			</div>)}
		</div>
	},

	RenderProperties: function(props) {
		const item = props.item as RepeatData
		return <>
			<label htmlFor='Repeat-source'>
				{Trans('source data')}
			</label>
			<div className="input-group mb-3">
				<span className="input-group-text fst-italic">ƒ</span>
				<InputApplyOnEnter
					id='Repeat-source'
					value={item.source}
					onChange={val=>props.setItem({...item, source: val})}
				/>
			</div>

			<label htmlFor='Repeat-varName' className='d-block'>
				{Trans('varName')}
			</label>
			<small className='text-muted d-block'>
				{Trans('repeat - current item is this var')}
			</small>
			<InputApplyOnEnter
				id='Repeat-varName'
				value={item.varName}
				onChange={val=>props.setItem({...item, varName: val})}
			/>

			<label htmlFor='Repeat-direction' className='d-block'>
				{Trans('repeat - direction')}
			</label>
			<select
				className='form-select'
				value={item.direction}
				onChange={e => props.setItem({...item, direction: e.currentTarget.value})}
				id='Repeat-direction'
			>
				{RepeatDirections.map(m => <option
					key={m}
					value={m}
				>
					{Trans(RepeatDirectionTrans[m])}
				</option>)}
			</select>
		</>
	},
}
