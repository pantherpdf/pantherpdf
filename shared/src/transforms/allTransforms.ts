/**
 * allTransforms.tsx
 * list of all widgets
 */


import type { TTransformWidget } from '../editor/types'
import { filter } from './filter'

export const allTransforms: {[key: string]: TTransformWidget} = {
	filter,
}

export default function getTransform(type: string): TTransformWidget {
	const c = allTransforms[type]
	if (c !== undefined)
		return c
	throw new Error(`Missing widget ${type}`)
}
