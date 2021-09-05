/**
 * PropertyBorder.tsx
 */


import React from 'react'
import Trans, { trKeys } from '../translation';
import { tuple } from '../types'
import InputApplyOnEnter from './InputApplyOnEnter'
import PropertyColor from './PropertyColor'


export const TBorderStyles = tuple('dotted', 'dashed', 'solid');
export type TBorderStyle = (typeof TBorderStyles)[number];

const borderData: {type: TBorderStyle, transKey: trKeys}[] = [
	{ type: 'solid', transKey: 'border-solid' },
	{ type: 'dashed', transKey: 'border-dashed' },
	{ type: 'dotted', transKey: 'border-dotted' },
]

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
		<label htmlFor={props.id ? `${props.id}-width`: undefined} className='d-block'>
			{Trans('width')}
			<span className='ms-2 text-muted'>
				[px]
			</span>
		</label>
		<InputApplyOnEnter
			id={props.id ? `${props.id}-width`: undefined}
			value={props.value.width}
			step={1}
			min={0}
			onChange={val => props.onChange({...props.value, width: (typeof val === 'number' ? val : 0)})}
		/>

		<label htmlFor={props.id ? `${props.id}-style`: undefined} className='d-block'>
			{Trans('border-style')}
		</label>
		<select
			className='form-select'
			id={props.id ? `${props.id}-width`: undefined}
			value={props.value.style}
			onChange={e => props.onChange({...props.value, style: e.currentTarget.value as TBorderStyle})}
		>
			{borderData.map(s => <option
				value={s.type}
				key={s.type}
			>
				{Trans(s.transKey)}
			</option>)}
		</select>

		<PropertyColor
			value={props.value.color}
			onChange={val => props.onChange({...props.value, color: val})}
		/>
	</>
}
