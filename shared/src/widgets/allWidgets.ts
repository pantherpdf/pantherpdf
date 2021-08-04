/**
 * allWidgets.tsx
 * list of all widgets
 */


import type { Widget } from '../editor/types'
import { textSimple } from './textSimple'
import { repeat } from './repeat'
import { counter } from './counter'
import { TextHtml } from './TextHtml'
import { Image } from './Image'
import { Columns, ColumnsCt } from './Columns'
import { Condition } from './Condition'

export const allWidgets: {[key: string]: Widget} = {
	textSimple,
	TextHtml,
	repeat,
	counter,
	Image,
	Columns,
	ColumnsCt,
	Condition,
}

export default function getWidget(type: string): Widget {
	const c = allWidgets[type]
	if (c !== undefined)
		return c
	throw new Error(`Missing widget ${type}`)
}
