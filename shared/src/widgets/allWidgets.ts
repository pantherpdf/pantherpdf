/**
 * allWidgets.tsx
 * list of all widgets
 */


import type { Widget } from '../editor/types'
import { textSimple } from './textSimple'
import { repeat } from './repeat'
import { counter } from './counter'

export const allWidgets: {[key: string]: Widget} = {
	textSimple,
	repeat,
	counter,
}

export default function getWidget(type: string): Widget {
	const c = allWidgets[type]
	if (c !== undefined)
		return c
	throw new Error(`Missing widget ${type}`)
}
