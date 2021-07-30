/**
 * compile.ts
 * Compile sourceData and report - evaluate all formulas
 */

import { TReport, TData } from '../types'
import type { TReportCompiled, TDataCompiled } from './types'
import FormulaEvaluate from '../formula/formula'
import getWidget from '../widgets/allWidgets'

type TOvrr = [string, any]

export class Helper {
	overrides: TOvrr[]

	constructor() {
		this.overrides = []
	}

	push(name: string, valueOrCb: any) {
		this.overrides.push([name, valueOrCb])
	}

	pop() {
		this.overrides.pop()
	}

	async getVar(name: string): Promise<any> {
		for (let i=this.overrides.length-1; i>=0; --i) {
			if (this.overrides[i][0] == name) {
				let val = this.overrides[i][1]
				if (typeof val == 'function') {
					val = await val()
				}
				return val
			}
		}
		return undefined
	}

	async evalFormula(txt: string): Promise<any> {
		return FormulaEvaluate(txt, {getVar: this.getVar.bind(this)})
	}

	async compileChildren(arr1: TData[]): Promise<TDataCompiled[]> {
		// dont use promise.all() because order of execution matters and some async operation could change it
		const arr2 = []
		for (const ch of arr1) {
			const dt = await getWidget(ch.type).compile(ch, this)
			arr2.push(dt)
		}
		return arr2
	}
}


export default async function compile(dt: TReport, obj: any): Promise<TReportCompiled> {
	const helper = new Helper()
	helper.push('obj', obj)
	const dt2: TReportCompiled = {...dt}
	dt2.children = await helper.compileChildren(dt.children)
	helper.pop()	
	return dt2
}
