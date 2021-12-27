/**
 * @jest-environment node
 */


import compile from './compile'
import type { ReportForceChildren } from './types'
import type { TReport } from '../types'
import type { TextSimpleData } from '../widgets/TextSimple'
import { sampleReport } from './sampleReport'
import makeHtml, { makeHtmlContent } from './makeHtml'
import renderer from 'react-test-renderer'

test('text', async () => {
	const report: ReportForceChildren<TextSimpleData> = {
		...sampleReport,
		children: [
			{type:'TextSimple', formula:'"Hello World: "+data.num', children:[]},
		]
	}

	const obj = { num: 123 }
	const compiled = await compile(report, obj)
	const html = makeHtmlContent(compiled)
  	expect(html).toMatchSnapshot();
})


test('should include google font', async () => {
	const report: TReport = {
		...sampleReport,
		children: [],
	}
	report.properties = {
		...report.properties,
		font: {
			family: 'Roboto Mono',
		},
	}
	const compiled = await compile(report, {})
	const html = makeHtml(compiled)
	expect(html.indexOf('https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,400&display=swap') !== -1 || html.indexOf('https://fonts.googleapis.com/css2?family=Roboto%20Mono:ital,wght@0,400&display=swap') !== -1)
})


test('should include globalCss', async () => {
	const compiled = await compile(sampleReport, {})
	compiled.globalCss = '.abc-def-123-456 { font-weight: bold }'
	const html = makeHtml(compiled)
	expect(html.indexOf('.abc-def-123-456 { font-weight: bold }') !== -1)
})
