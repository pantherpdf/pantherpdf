/**
 * @jest-environment node
 */


/*
test('built-in functions', async () => {
	await expect(FormulaEvaluate('arrayIndexOf([1,2,3], 2)')).resolves.toBe(1)
	await expect(FormulaEvaluate('arrayIndexOf({a:1}, 1)')).rejects.toThrow()
})
*/

import compile from './compile'
import type { ReportForceChildren } from './types'
import type { TextSimpleData, TextSimpleCompiled } from '../widgets/textSimple'
import { sampleReport } from './sampleReport'

test('text data', async () => {
	const report: ReportForceChildren<TextSimpleData> = {
		...sampleReport,
		children: [
			{type:'textSimple', formula:'"Hello World: "+data.num', children:[]},
		]
	}

	const obj = { num: 123 }
	const compiled = await compile(report, obj)

	expect(compiled.children.length).toBe(1)
	expect(compiled.children[0].type).toBe('textSimple')
	const c = compiled.children[0] as TextSimpleCompiled
	expect(c.data).toBe('Hello World: 123')
})


test('text report', async () => {
	const report: ReportForceChildren<TextSimpleData> = {
		...sampleReport,
		children: [
			{type:'textSimple', formula:'"Hello World: "+report.children[0].type', children:[]},
		]
	}

	const obj = { num: 123 }
	const compiled = await compile(report, obj)

	expect(compiled.children.length).toBe(1)
	expect(compiled.children[0].type).toBe('textSimple')
	const c = compiled.children[0] as TextSimpleCompiled
	expect(c.data).toBe('Hello World: textSimple')
})


test('text', async () => {
	const report: ReportForceChildren<TextSimpleData> = {
		...sampleReport,
		children: [
			{type:'textSimple', formula:'non_EXIStent', children:[]},
		]
	}

	const obj = { num: 123 }
	await expect(compile(report, obj)).rejects.toThrow()
})
