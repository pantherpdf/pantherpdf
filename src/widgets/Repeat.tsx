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
	addChildElement: boolean,
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
		for (let i = 0; i < value.length; ++i) {
			helper.formulaHelper.push(dt.varName, value[i])
			helper.formulaHelper.push(dt.varName+'_i', i)
			const ch2 = await helper.compileChildren(dt.children, helper)
			children.push(ch2)
			helper.formulaHelper.pop()
			helper.formulaHelper.pop()
		}
		let addChildElement = true
		if (dt.direction === 'grid') {
			// remove <div> when only one child and this child is frame
			if (dt.children.length === 1 && dt.children[0].type === 'Frame') {
				// dont display as flex because flex and page-break-inside: avoid dont work together
				// dont add additional div, so that frame can control width/height
				// add css to frame
				// inline-block to display them in line
				// vertical-align: top, to prevent vertical space between frames
				addChildElement = false
				if (helper.reportCompiled.globalCss.indexOf('.grid-with-frame') === -1) {
					helper.reportCompiled.globalCss += `
						.grid-with-frame > div {
							display: inline-block;
							vertical-align: top;
						}
					`
				}
			}
		}
		return {
			type: dt.type,
			children,
			direction: dt.direction,
			addChildElement,
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
			return item.children.map(item => props.renderChildren(item, props)).join('') + '\n'
		}
		const cssParent: CSSProperties = {}
		const cssItem: CSSProperties = {}
		if (item.direction === 'columns') {
			cssParent.display = 'flex'
			const w = item.children.length > 0 ? 1 / item.children.length : 1
			cssItem.flex = `0 0 ${(w * 100).toLocaleString('en-US', {maximumFractionDigits:4})}%`
		}
		if (item.direction === 'grid') {
			if (item.addChildElement) {
				cssParent.display = 'flex'
				cssParent.flexWrap = 'wrap'
			}
			else {
				cssParent.display = 'block'
			}
		}

		if (item.addChildElement) {
			return `<div style="${props.styleToStringAttribute(cssParent)}">
				${item.children.map((item2, idx) => {
					return `<div
						style="${props.styleToStringAttribute(cssItem)}"
					>
						${props.renderChildren(item2, props)}
					</div>`
				}).join('')}
			</div>\n`
		}
		else {
			return `<div style="${props.styleToStringAttribute(cssParent)}" class="grid-with-frame">
				${item.children.map(item2 => props.renderChildren(item2, props)).join('')}
			</div>\n`
		}
	},

	RenderProperties: function(props) {
		const item = props.item as RepeatData
		return <>
			<div className='hform'>
				<label htmlFor='Repeat-source'>
					{Trans('source data')}
				</label>
				<div className='input-group'>
					<span className="input-group-text fst-italic">ƒ</span>
					<InputApplyOnEnter
						id='Repeat-source'
						value={item.source}
						onChange={val=>props.setItem({...item, source: val})}
					/>
				</div>
			</div>

			<div className='hform'>
				<label htmlFor='Repeat-varName'>
					{Trans('varName')}
				</label>
				<InputApplyOnEnter
					id='Repeat-varName'
					value={item.varName}
					onChange={val=>props.setItem({...item, varName: val})}
				/>
			</div>
			<small className='text-muted d-block'>
				{Trans('repeat - current item is this var')}
			</small>
			<small className='text-muted d-block mb-3'>
				{Trans('repeat - index name', [`${item.varName}_i`])}
			</small>

			<div className='hform'>
				<label htmlFor='Repeat-direction'>
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
			</div>
		</>
	},
}
