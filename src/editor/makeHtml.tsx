/**
 * makeHtml.ts
 * Compiled report -> html
 */


import React from 'react'
import type { TReportCompiled } from '../types'
import type { ItemRendeFinalHelper } from './types'
import getWidget from '../widgets/allWidgets'


export default function makeHtml(report: TReportCompiled, externalHelpers: {[key: string]: any}={}) {
	const helper: ItemRendeFinalHelper = {
		renderItem: (item, helper) => {
			const w = getWidget(item.type)
			return <w.RenderFinal {...helper} item={item} />
		},
		renderChildren: (chs, helper) => {
			if (!Array.isArray(chs)) {
				throw new Error('Bad childs array')
			}
			return <>{chs.map((item, idx) => {
				const w = getWidget(item.type)
				return <w.RenderFinal {...helper} item={item} key={idx} />
			})}</>
		},
		externalHelpers,
	}

	const arr = helper.renderChildren(report.children, helper)
	return arr
}
