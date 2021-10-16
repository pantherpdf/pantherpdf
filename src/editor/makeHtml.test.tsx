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
	const component = renderer.create(<>{html}</>)
	const tree = component.toJSON()
  	expect(tree).toMatchSnapshot();
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
	expect(html.indexOf('https://fonts.googleapis.com/css?family=Roboto+Mono')!=-1 || html.indexOf('https://fonts.googleapis.com/css?family=Roboto%20Mono')!=-1)
})
