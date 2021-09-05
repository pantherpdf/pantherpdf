/**
 * BoxName.tsx
 * Show little name/type of a widget
 */


import React from 'react'
import { TransName } from '../translation'
import { ItemRendeProps, TName } from '../editor/types'
import style from './BoxName.module.css'

interface Props extends ItemRendeProps {
	className?: string,
	name: TName,
	children: React.ReactNode,
	style?: React.CSSProperties,
	visible?: boolean,
}

export default function BoxName(props: Props) {
	const cls = style.boxParent + ' ' + (props.className || '')
	return <div
		className={cls}
		style={props.style}
	>
		<div
			className={`${style.name} text-nowrap overflow-hidden ${typeof props.visible === 'boolean' && !props.visible ? 'd-none' : ''}`}
			draggable={true} /* allways true to allow dragging TextHtml */
			onDragStart={e => props.dragWidgetStart(e, {type:'wid', wid:props.wid})}
			onDragEnd={e => props.dragWidgetEnd(e)}
		>
			{TransName(props.name)}
		</div>
		{props.children}
	</div>
}
