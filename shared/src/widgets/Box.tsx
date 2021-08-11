/**
 * Box.tsx
 */


import React, { useState, useEffect, CSSProperties } from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faBorderStyle } from '@fortawesome/free-solid-svg-icons'
import PropertyColor from './PropertyColor'
import PropertyBorder, { Border, genBorderCss } from './PropertyBorder'
import BoxName from './BoxName'


interface Properties {
	margin: [number, number, number, number],
	padding: [number, number, number, number],
	border: Border | [Border, Border, Border, Border],
	backgroundColor?: string,
}
export type BoxData = TData & Properties
export type BoxCompiled = TDataCompiled & Properties


function genStyle(item: BoxData | BoxCompiled): CSSProperties {
	const css: CSSProperties = {
		margin: `${item.margin[0]}px ${item.margin[1]}px ${item.margin[2]}px ${item.margin[3]}px`,
		padding: `${item.padding[0]}px ${item.padding[1]}px ${item.padding[2]}px ${item.padding[3]}px`,
	}
	
	if (Array.isArray(item.border)) {
		css.borderTop = genBorderCss(item.border[0])
		css.borderRight = genBorderCss(item.border[1])
		css.borderBottom = genBorderCss(item.border[2])
		css.borderLeft = genBorderCss(item.border[3])
	}
	else {
		css.border = genBorderCss(item.border)
	}
	if (item.backgroundColor) {
		css.backgroundColor = item.backgroundColor
	}
	return css
}


type Property4SideRangeValue = [number, number, number, number]
interface Property4SideRangeProps {
	id: string,
	min: number,
	max: number,
	value: Property4SideRangeValue,
	onChange: (val: Property4SideRangeValue) => void,
}
function Property4SideRange(props: Property4SideRangeProps) {
	const [value, setValue] = useState<Property4SideRangeValue>(props.value)

	useEffect(() => {
		setValue(props.value)
	}, [props.value])

	// only call onChange() when user releases mouse
	useEffect(() => {
		window.document.documentElement.addEventListener('mouseup', mouseup);
		return () => {
			window.document.documentElement.removeEventListener('mouseup', mouseup);
		}
	})
	const mouseup = () => {
		if (value !== props.value) {
			props.onChange(value)
		}
	}

	function renderInput(idx: number) {
		const st: CSSProperties = {
			width: '50%',
			display: 'inline',
		}
		return <input
			type='range'
			id={`${props.id}-${idx}`}
			style={st}
			min={props.min}
			max={props.max}
			value={value[idx]}
			onChange={e => {
				const arr: Property4SideRangeValue = [...value]
				arr[idx] = parseInt(e.currentTarget.value)
				setValue(arr)
			}}
			className='form-range'
		/>
	}

	return <div>
		<div style={{textAlign:'center'}}>
			{renderInput(0)}
		</div>
		<div className="d-flex">
			{renderInput(3)}
			{renderInput(1)}
		</div>
		<div style={{textAlign:'center'}}>
			{renderInput(2)}
		</div>
	</div>
}




export const Box: Widget = {
	name: {en: 'Box'},
	icon: {fontawesome: faBorderStyle},

	newItem: async (): Promise<BoxData> => {
		return {
			type: 'Box',
			children: [],
			margin: [0, 0, 0, 0],
			padding: [0, 0, 0, 0],
			border: {
				width: 1,
				style: 'solid',
				color: '#333333',
			}
		}
	},

	compile: async (dt: BoxData, helpers): Promise<BoxCompiled> => {
		return {
			...dt,
		}
	},

	Render: function(props) {
		const item = props.item as BoxData
		return <BoxName {...props} style={genStyle(item)} name={Box.name}>
			{props.renderWidgets(item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		const item = props.item as BoxCompiled
		return <div style={genStyle(item)}>
			{props.renderChildren(item.children, props)}
		</div>
	},

	RenderProperties: function(props) {
		const item = props.item as BoxData
		return <>
			<label htmlFor='box-margin'>Margin</label>
			<Property4SideRange
				id='box-margin'
				min={0}
				max={80}
				value={item.margin}
				onChange={val => props.setItem({...props.item, margin: val})}
			/>

			<hr />
			
			<label htmlFor='box-padding'>Padding</label>
			<Property4SideRange
				id='box-padding'
				min={0}
				max={80}
				value={item.padding}
				onChange={val => props.setItem({...props.item, padding: val})}
			/>

			<hr />

			<div className="form-check">
				<input
					type='checkbox'
					id='box-border-single'
					className='form-check-input'
					checked={Array.isArray(item.border)}
					onChange={e => {
						const obj: BoxData = {...item}
						if (e.currentTarget.checked) {
							const brd: Border = !Array.isArray(item.border) ? item.border : {width:1, color: '#cccccc', style:'solid'}
							obj.border = [{...brd}, {...brd}, {...brd}, {...brd}]
						}
						else {
							obj.border = {width:1, color: '#cccccc', style:'solid'}
						}
						props.setItem(obj)
					}}
				/>
				<label className="form-check-label" htmlFor='box-border-single'>
					Border different sides
				</label>
			</div>
			
			{Array.isArray(item.border) && ['top','right','bottom','left'].map((side, idx) => {
				const val2 = Array.isArray(item.border) ? item.border : [item.border, item.border, item.border, item.border]
				return <React.Fragment key={side}>
					<div>{side}</div>
					<PropertyBorder
						value={val2[idx]}
						onChange={val => {
							const arr = [...val2]
							arr[idx] = val
							props.setItem({...item, border: arr})
						}}
					/>
				</React.Fragment>
			})}
			{!Array.isArray(item.border) && <PropertyBorder
				value={item.border}
				onChange={val => props.setItem({...item, border: val})}
			/>}
			<hr />

			<div className="form-check">
				<input
					type='checkbox'
					id='box-backgroundColor-enable'
					className='form-check-input'
					checked={!!item.backgroundColor}
					onChange={e => {
						const obj: BoxData = {...item}
						if (e.currentTarget.checked) {
							obj.backgroundColor = '#FFCCCC'
						}
						else {
							delete obj.backgroundColor
						}
						props.setItem(obj)
					}}
				/>
				<label className="form-check-label" htmlFor='box-backgroundColor-enable'>
					Background
				</label>
			</div>
			{!!item.backgroundColor && <PropertyColor
				value={item.backgroundColor}
				onChange={val => props.setItem({...item, backgroundColor: val})}
			/>}
		</>
	},
}
