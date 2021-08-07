/**
 * PropertyBorder.tsx
 */


import React from 'react'
import { tuple } from '../types'
import InputApplyOnEnter from './InputApplyOnEnter'
import PropertyColor from './PropertyColor'


export const TBorderStyles = tuple('dotted', 'dashed', 'solid');
export type TBorderStyle = (typeof TBorderStyles)[number];

export interface Border {
	width: number,
	color: string,
	style: TBorderStyle,
}

export function genBorderCss(b: Border): string {
	return `${b.width}px ${b.style} ${b.color}`
}

interface BorderEditorProps {
	id?: string,
	value: Border,
	onChange: (value: Border) => void,
}
export default function BorderEditor(props: BorderEditorProps) {
	return <>
		<div>
			<label htmlFor={props.id ? `${props.id}-width`: undefined}>
				Width
			</label>
			<span className='ms-2 text-muted'>
				[px]
			</span>
		</div>
		<InputApplyOnEnter
			id={props.id ? `${props.id}-width`: undefined}
			value={props.value.width}
			step={1}
			min={0}
			onChange={val => props.onChange({...props.value, width: (typeof val === 'number' ? val : 0)})}
		/>

		<div>
			<label htmlFor={props.id ? `${props.id}-style`: undefined}>
				Style
			</label>
		</div>
		<select
			className='form-select'
			id={props.id ? `${props.id}-width`: undefined}
			value={props.value.style}
			onChange={e => props.onChange({...props.value, style: e.currentTarget.value as TBorderStyle})}
		>
			{TBorderStyles.map(s => <option
				value={s}
				key={s}
			>
				{s}
			</option>)}
		</select>

		<PropertyColor
			value={props.value.color}
			onChange={val => props.onChange({...props.value, color: val})}
		/>
	</>
}
