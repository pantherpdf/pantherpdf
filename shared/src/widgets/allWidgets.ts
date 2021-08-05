/**
 * allWidgets.tsx
 * list of all widgets
 */


import type { Widget } from '../editor/types'
import { TextSimple } from './TextSimple'
import { Repeat } from './Repeat'
import { Counter } from './Counter'
import { TextHtml } from './TextHtml'
import { Image } from './Image'
import { Columns, ColumnsCt } from './Columns'
import { Condition } from './Condition'
import { FirstMatch } from './FirstMatch'
import { Html } from './Html'
import { Separator } from './Separator'
import { Spacer } from './Spacer'
import { Box } from './Box'
import { SetVar } from './SetVar'

export const allWidgets: {[key: string]: Widget} = {
	TextSimple,
	TextHtml,
	Repeat,
	Counter,
	Image,
	Columns,
	ColumnsCt,
	Condition,
	FirstMatch,
	Html,
	Separator,
	Spacer,
	Box,
	SetVar,
}

export default function getWidget(type: string): Widget {
	const c = allWidgets[type]
	if (c !== undefined)
		return c
	throw new Error(`Missing widget ${type}`)
}
