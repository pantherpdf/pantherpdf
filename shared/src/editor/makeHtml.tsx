/**
 * makeHtml.ts
 * Compiled report -> html
 */


import React from 'react'
import type { TReportCompiled, ItemRendeFinalProps, TDataCompiled, ItemRendeFinalHelper } from './types'
import getWidget from '../widgets/allWidgets'


export default function makeHtml(report: TReportCompiled) {
	const helper: ItemRendeFinalHelper = {
		renderItem: (item, helper) => {
			const w = getWidget(item.type)
			return <w.RenderFinal {...helper} item={item} />
		},
		renderChildren: (chs, helper) => {
			return <div>{chs.map((item, idx) => {
				const w = getWidget(item.type)
				return <w.RenderFinal {...helper} item={item} key={idx} />
			})}</div>  // todo key
		},
	}

	const arr = helper.renderChildren(report.children, helper)
	return arr
}
