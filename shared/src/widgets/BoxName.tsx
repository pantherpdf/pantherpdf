/**
 * BoxName.tsx
 * Show little name/type of a widget
 */


import React from 'react'
import { TransName } from '../translation'
import { TName } from '../editor/types'
import style from './BoxName.module.css'

interface Props {
	className: string,
	name: TName,
	children: React.ReactNode,
	style?: React.CSSProperties,
	preview: boolean,
}

export default function BoxName(props: Props) {
	let cls = props.preview ? style.boxParentPreview : style.boxParent
	cls += ' ' + (props.className || '')
	return <div className={cls} style={props.style}>
		{!props.preview && <div className={style.name}>{TransName(props.name)}</div>}
		{props.children}
	</div>
}
