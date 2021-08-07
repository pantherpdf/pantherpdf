/**
 * Columns.tsx
 */


import React, { CSSProperties } from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faColumns, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter, { WidthRegex, WidthOptions } from './InputApplyOnEnter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export interface ColumnsCtData extends TData {
	type: 'ColumnsCt',
}

export interface ColumnsCtCompiled extends TDataCompiled {
	type: 'ColumnsCt',
}

export const ColumnsCt: Widget = {
	name: {en: 'ColumnsCt'},
	icon: {fontawesome: faColumns},

	newItem: async (): Promise<ColumnsCtData> => {
		return {
			type: 'ColumnsCt',
			children: [],
		}
	},

	compile: async (dt: ColumnsCtData, helper): Promise<ColumnsCtCompiled> => {
		return {
			type: dt.type,
			children: await helper.compileChildren(dt.children, helper),
		}
	},

	Render: function(props) {
		// handled by Columns
		return null
	},

	RenderFinal: function(props) {
		// handled by Columns
		return null
	},

	RenderProperties: function() {
		return null
	},

	canAdd: false,
	canSelect: false,
	canDrag: false,
}






export interface ColumnsData extends TData {
	type: 'Columns',
	widths: string[],
}

export interface ColumnsCompiled extends TDataCompiled {
	type: 'Columns',
	widths: string[],
}

function colStyle(w: string): CSSProperties {
	if(w && w.length > 0) {
		if(w.match(/^-{0,1}\d+$/)){
			return {
				flex: `${w} 1 auto`,
			}
		}
		else {
			return {
				flex: `0 0 ${w}`,
				minWidth: w,
				maxWidth: w,
			}
		}
	}
	return {
		flex: '1 1 auto',
	}
}

export const Columns: Widget = {
	name: {en: 'Columns'},
	icon: {fontawesome: faColumns},

	newItem: async (): Promise<ColumnsData> => {
		return {
			type: 'Columns',
			children: [
				await ColumnsCt.newItem(),
				await ColumnsCt.newItem(),
				await ColumnsCt.newItem(),
			],
			widths: [
				'',
				'',
				'',
			]
		}
	},

	compile: async (dt: ColumnsData, helper): Promise<ColumnsCompiled> => {
		return {
			type: dt.type,
			children: await helper.compileChildren(dt.children, helper),
			widths: dt.widths,
		}
	},

	Render: function(props) {
		const item = props.item as ColumnsData
		const baseStyle: CSSProperties = {
			border: '1px solid #ccc',
		}
		return <BoxName name={Columns.name}>
			<div
				style={{
					display: 'flex',
					alignItems: 'stretch',
				}}
			>
				{item.children.map((ch, idx) => <div
					key={idx}
					style={{...baseStyle, ...colStyle(item.widths[idx])}}
				>
					{props.renderWidgets(ch.children, [...props.wid, idx])}
				</div>)}
			</div>
		</BoxName>
	},

	RenderFinal: function(props) {
		const item = props.item as ColumnsCompiled
		return <div
			style={{
				display: 'flex',
			}}
		>
			{item.children.map((ch, idx) => <div
				key={idx}
				style={colStyle(item.widths[idx])}
			>
				{props.renderChildren(ch.children, {...props})}
			</div>)}
		</div>
	},

	RenderProperties: function(props) {
		const item = props.item as ColumnsData
		return <>
			<div>
				<label>Width</label>
				<br />
				<small className='text-muted'>{WidthOptions}</small>
			</div>
			{item.widths.map((w, idx) => <div
				key={idx}
				className='input-group'
			>
				<InputApplyOnEnter
					id="width"
					value={w}
					onChange={val => {
						const arr = [...item.widths]
						arr[idx] = String(val)
						props.setItem({...item, widths: arr})
					}}
					regex={WidthRegex}
					style={{flex: '1'}}
				/>
				<button
					className='btn btn-outline-secondary'
					onClick={() => {
						const ws = [...item.widths]
						const chs = [...item.children]
						ws.splice(idx, 1)
						chs.splice(idx, 1)
						props.setItem({...item, widths: ws, children: chs})
					}}
				>
					<FontAwesomeIcon icon={faTimes} />
				</button>
			</div>)}
			<div>
				<button
					className='btn btn-secondary'
					onClick={async () => {
						const ws = [...item.widths]
						const chs = [...item.children, await ColumnsCt.newItem()]
						props.setItem({...item, widths: ws, children: chs})
					}}
				>
					<FontAwesomeIcon icon={faPlus} className='me-2' />
					Add column
				</button>
			</div>
		</>
	},
}
