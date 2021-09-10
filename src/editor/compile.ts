/**
 * compile.ts
 * Compile sourceData and report - evaluate all formulas
 */

import { TReport, TData, ApiEndpoints } from '../types'
import type { TReportCompiled, TDataCompiled } from '../types'
import FormulaEvaluate from '../formula/formula'
import getWidget from '../widgets/allWidgets'
import { CompileHelper } from './types'

type TOvrr = [string, any]

export class FormulaHelper {
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
			if (this.overrides[i][0] === name) {
				let val = this.overrides[i][1]
				if (typeof val == 'function') {
					val = await val(name)
				}
				return val
			}
		}
		return undefined
	}
}


export default async function compile(report: TReport, data: any, api: ApiEndpoints={}, externalHelpers: {[key: string]: any}={}): Promise<TReportCompiled> {
	// make a copy, to support changing
	report = JSON.parse(JSON.stringify(report))

	const formulaHelper = new FormulaHelper()
	const getVar = formulaHelper.getVar.bind(formulaHelper)
	formulaHelper.push('data', data)
	formulaHelper.push('report', report)
	
	// custom variables
	const vars: {[key: string]: any} = {}
	function getVarValue(varName: string): any {
		return vars[varName]
	}
	for (const v of report.variables) {
		vars[v.name] = await FormulaEvaluate(v.formula, {getVar})
		formulaHelper.push(v.name, getVarValue)
	}

	const dt2: TReportCompiled = {...report}

	if (dt2.properties.fileName) {
		const res = await FormulaEvaluate(dt2.properties.fileName, {getVar})
		if (typeof res !== 'string') {
			throw new Error(`Filename should be a string, but received ${typeof res}`)
		}
		dt2.properties.fileName = res
	}
	
	const helper: CompileHelper = {
		wid: [],
		report: report,
		formulaHelper,
		api,
		variables: vars,
		externalHelpers,
		
		evalFormula: async (txt: string) => {
			return FormulaEvaluate(txt, {getVar})
		},
	
		compileChildren: async (arr1: TData[], helper: CompileHelper) => {
			// dont use promise.all() because order of execution matters and some async operation could change it
			const arr2 = []
			for (let i=0; i<arr1.length; ++i) {
				const ch = arr1[i]
				const helper2 = {...helper, wid:[...helper.wid, i]}
				const dt = await getWidget(ch.type).compile(ch, helper2)
				arr2.push(dt)
			}
			return arr2
		},
	}

	dt2.children = await helper.compileChildren(report.children, helper)
	
	formulaHelper.pop()
	formulaHelper.pop()
	report.variables.map(() => formulaHelper.pop())
	if (formulaHelper.overrides.length !== 0) {
		throw new Error('helper has overrides still left inside')
	}
	return dt2
}


export async function compileComponent(cmpData: object, data: any): Promise<TDataCompiled> {
	const dt: TReport = {
		_id: '',
		target: 'pdf',
		version: '1.0.0',
		name: 'John Johnny',
		email: 'admin@admin.com',
		time: '2020-01-01T01:01:01Z',
		children: [
			cmpData as TData,
		],
		transforms: [],
		properties: { },
		dataUrl: '',
		variables: [],
	}
	const reportCompiled = await compile(dt, data)
	return reportCompiled.children[0]
}
