/**
 * Frame.tsx
 */


import React, { CSSProperties } from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faBorderStyle } from '@fortawesome/free-solid-svg-icons'
import PropertyColor from './PropertyColor'
import PropertyBorder, { Border, genBorderCss } from './PropertyBorder'
import BoxName from './BoxName'
import Trans from '../translation'
import InputApplyOnEnter, { WidthOptions, WidthRegex } from './InputApplyOnEnter'
import PropertyFont, { PropertyFontExtractStyle, PropertyFontGenCss, TFont } from './PropertyFont'
import { LoadGoogleFontCss } from './GoogleFonts'
import useStateDelayed from '../useStateDelayed'


interface Properties {
	margin: [number, number, number, number],
	padding: [number, number, number, number],
	border: Border | [Border, Border, Border, Border],
	width: string,
	height: string,
	backgroundColor?: string,
	pageBreakAvoid?: boolean,
	font: TFont,
}
export type FrameData = TData & Properties
export type FrameCompiled = TDataCompiled & Properties & {children: TDataCompiled[]}


function genStyle(item: FrameData | FrameCompiled, final: boolean): CSSProperties {
	const css: CSSProperties = {
		margin: `${item.margin[0]}px ${item.margin[1]}px ${item.margin[2]}px ${item.margin[3]}px`,
		padding: `${item.padding[0]}px ${item.padding[1]}px ${item.padding[2]}px ${item.padding[3]}px`,
		boxSizing: 'border-box',
		width: 'auto',  // in preview, to override width:100%
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

	if (final) {
		if (item.width.length > 0) {
			css.width = item.width
			css.flex = `0 0 ${item.width}`
			css.overflowX = 'hidden'
		}
		if (item.height.length > 0) {
			css.height = item.height
			css.overflowY = 'hidden'
		}
	}
	else {
		if (item.width.length > 0) {
			css.width = item.width
		}
		if (item.height.length > 0) {
			css.minHeight = item.height
		}
	}

	if (item.pageBreakAvoid) {
		css.pageBreakInside = 'avoid'
	}

	const cssFont = PropertyFontGenCss(item.font)
	Object.assign(css, cssFont)

	return css
}


type Property4SideRangeValue = [number, number, number, number]
interface Property4SideRangeProps {
	id: string,
	label: string,
	min: number,
	max: number,
	value: Property4SideRangeValue,
	onChange: (val: Property4SideRangeValue) => void,
}
function Property4SideRange(props: Property4SideRangeProps) {
	const [value, setValue] = useStateDelayed<Property4SideRangeValue>(props.value, props.onChange)

	function renderInput(idx: number) {
		const st: CSSProperties = {
			width: '50%',
			display: 'inline',
		}
		function setValueInput(val: string, delay: number) {
			const arr: Property4SideRangeValue = [...value]
			arr[idx] = parseInt(val)
			return setValue(arr, delay)
		}
		return <input
			type='range'
			id={`${props.id}-${idx}`}
			style={st}
			min={props.min}
			max={props.max}
			value={value[idx]}
			onChange={e => setValueInput(e.currentTarget.value, 300)}
			onMouseUp={e => setValueInput(e.currentTarget.value, 0)}
			className='form-range'
		/>
	}

	return <div>
		<div className='section-name'>
			{props.label}
			<small className='ms-2 text-muted'>
				{value[0]}, {value[1]}, {value[2]}, {value[3]} px
			</small>
		</div>
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




export const Frame: Widget = {
	name: {en: 'Frame', sl: 'Okvir'},
	icon: {fontawesome: faBorderStyle},

	newItem: async (): Promise<FrameData> => {
		return {
			type: 'Frame',
			children: [],
			margin: [0, 0, 0, 0],
			padding: [0, 0, 0, 0],
			border: {
				width: 1,
				style: 'solid',
				color: '#333333',
			},
			width: '',
			height: '',
			font: {},
		}
	},

	compile: async (dt: FrameData, helpers): Promise<FrameCompiled> => {
		const dt2: FrameCompiled = JSON.parse(JSON.stringify({...dt, children: []}))
		const style = PropertyFontExtractStyle(dt.font)
		if (style) {
			helpers.reportCompiled.fontsUsed.push(style)
		}
		dt2.children = await helpers.compileChildren(dt.children, helpers)
		return dt2
	},

	Render: function(props) {
		const item = props.item as FrameData
		const fontStyle = PropertyFontExtractStyle(item.font)
		if (fontStyle) {
			LoadGoogleFontCss(fontStyle)
		}
		return <BoxName {...props} style={genStyle(item, false)} name={Frame.name}>
			{props.renderWidgets(item.children, props.wid)}
		</BoxName>
	},

	RenderFinal: function(props) {
		const item = props.item as FrameCompiled
		const style = genStyle(item, true)
		return `<div style="${props.styleToStringAttribute(style)}">
			${props.renderChildren(item.children, props)}
		</div>`
	},

	RenderProperties: function(props) {
		const item = props.item as FrameData
		return <>
			<div className='vform'>
				<label htmlFor='Frame-width'>
					{Trans('width')}
					<small className='text-muted ms-1'>
						[{WidthOptions}]
					</small>
				</label>
				<InputApplyOnEnter
					id='Frame-width'
					value={item.width || ''}
					onChange={val => props.setItem({...item, width: String(val)})}
					regex={WidthRegex}
				/>
			</div>

			<div className='vform'>
				<label htmlFor='Frame-height'>
					{Trans('height')}
					<small className='text-muted ms-1'>
						[{WidthOptions}]
					</small>
				</label>
				<InputApplyOnEnter
					id='Frame-height'
					value={item.height || ''}
					onChange={val => props.setItem({...item, height: String(val)})}
					regex={WidthRegex}
				/>
			</div>

			<div className="form-check">
				<input
					type='checkbox'
					id='Frame-backgroundColor-enable'
					className='form-check-input'
					checked={!!item.backgroundColor}
					onChange={e => {
						const obj: FrameData = {...item}
						if (e.currentTarget.checked) {
							obj.backgroundColor = '#FFCCCC'
						}
						else {
							delete obj.backgroundColor
						}
						props.setItem(obj)
					}}
				/>
				<label className="form-check-label" htmlFor='Frame-backgroundColor-enable'>
					{Trans('background')}
				</label>
			</div>
			{!!item.backgroundColor && <PropertyColor
				value={item.backgroundColor}
				onChange={val => props.setItem({...item, backgroundColor: val})}
			/>}

			<Property4SideRange
				id='Frame-margin'
				label={Trans('margin')}
				min={0}
				max={80}
				value={item.margin}
				onChange={val => props.setItem({...props.item, margin: val})}
			/>

			<Property4SideRange
				id='Frame-padding'
				label={Trans('padding')}
				min={0}
				max={80}
				value={item.padding}
				onChange={val => props.setItem({...props.item, padding: val})}
			/>

			<div className='section-name'>
				{Trans('border')}
			</div>

			<div className='form-check mb-3'>
				<input
					type='checkbox'
					id='Frame-border-single'
					className='form-check-input'
					checked={Array.isArray(item.border)}
					onChange={e => {
						const obj: FrameData = {...item}
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
				<label className="form-check-label" htmlFor='Frame-border-single'>
					{Trans('border different sides')}
				</label>
			</div>
			
			{Array.isArray(item.border) && ['top','right','bottom','left'].map((side2, idx) => {
				const side = side2 as 'top'|'right'|'bottom'|'left'
				const val2 = Array.isArray(item.border) ? item.border : [item.border, item.border, item.border, item.border]
				return <React.Fragment key={side}>
					<div className='section-name'>
						{Trans(`border-${side}`)}
					</div>
					<PropertyBorder
						id={`Frame-border-${side}`}
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
				id={`Frame-border-full`}
				value={item.border}
				onChange={val => props.setItem({...item, border: val})}
			/>}

			<div className='section-name'>
				{Trans('other')}
			</div>
			<div className='hform'>
				<label>
					{Trans('font')}
				</label>
				<PropertyFont
					value={item.font}
					onChange={val => props.setItem({...props.item, font: val})}
					googleFontApiKey={props.api.googleFontApiKey}
				/>
			</div>
			<div className='form-check'>
				<input
					type='checkbox'
					id='Frame-page-break-avoid'
					className='form-check-input'
					checked={!!item.pageBreakAvoid}
					onChange={e => {
						const obj: FrameData = {...item}
						obj.pageBreakAvoid = e.currentTarget.checked
						props.setItem(obj)
					}}
				/>
				<label className='form-check-label' htmlFor='Frame-page-break-avoid'>
					{Trans('page-break-avoid')}
				</label>
			</div>
			
		</>
	},
}
