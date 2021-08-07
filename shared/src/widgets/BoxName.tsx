/**
 * BoxName.tsx
 * Show little name/type of a widget
 */


import React from 'react'
import { TransName } from '../translation'
import { TName } from '../editor/types'
import style from './BoxName.module.css'

interface Props {
	className?: string,
	name: TName,
	children: React.ReactNode,
	style?: React.CSSProperties,
}

export default function BoxName(props: Props) {
	const cls = style.boxParent + ' ' + (props.className || '')
	return <div
		className={cls}
		style={props.style}
	>
		<div
			className={`${style.name} text-nowrap overflow-hidden`}
		>
			{TransName(props.name)}
		</div>
		{props.children}
	</div>
}
