/**
 * PageBreak.tsx
 */


import React from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faGripLines } from '@fortawesome/free-solid-svg-icons'


export type PageBreakData = TData & {type: 'PageBreak'}
export type PageBreakCompiled = TDataCompiled & {type: 'PageBreak'}


export const PageBreak: Widget = {
	name: {en: 'Page Break', sl: 'Prelom Strani'},
	icon: {fontawesome: faGripLines},

	newItem: async (): Promise<PageBreakData> => {
		return {
			type: 'PageBreak',
			children: [],
		}
	},

	compile: async (dt: PageBreakData, helpers): Promise<PageBreakCompiled> => {
		return {
			...dt,
		}
	},

	Render: function() {
		return <hr style={{
			height: '10px',
			margin: '0.3rem 0',
			backgroundColor: 'transparent',
			backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjAnIGhlaWdodD0nMTAnIHZpZXdCb3g9JzAgMCAyMCAxMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczpzZXJpZj0naHR0cDovL3d3dy5zZXJpZi5jb20vJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIGNsaXAtcnVsZT0nZXZlbm9kZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlLW1pdGVybGltaXQ9JzEuNDE0Jz48cGF0aCBmaWxsPSdub25lJyBkPSdNMCAwaDIwdjEwSDB6Jy8+PGNsaXBQYXRoIGlkPSdhJz48cGF0aCBzZXJpZjppZD0nemlnemFnJyBkPSdNMCAwaDIwdjEwSDB6Jy8+PC9jbGlwUGF0aD48ZyBjbGlwLXBhdGg9J3VybCgjYSknPjxwYXRoIGQ9J00yMC43MDUuNzEyTDEwIDkuOTgtLjcwNS43MTJsLjY1NC0uNzU3TDEwIDguNjU3IDIwLjA1MS0uMDQ1bC42NTQuNzU3eicvPjwvZz48L3N2Zz4=')",
		}} />
	},

	RenderFinal: function() {
		return <div style={{
			pageBreakBefore: 'always',
		}} />
	},

	RenderProperties: function() {
		return null
	},
}
