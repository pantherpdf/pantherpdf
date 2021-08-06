/**
 * @jest-environment node
 */

import { TextHtml, TextHtmlData, TextHtmlCompiled, evaluateFormulaInsideHtml } from './TextHtml'
import compile, { compileComponent, FormulaHelper } from '../editor/compile'
import makeHtml from '../editor/makeHtml'
import renderer from 'react-test-renderer'
import { ReportForceChildren } from '../editor/types'
import { sampleReport } from '../editor/sampleReport'

test('parse TextHtml formula', async () => {
const html = `aaa
<div>a<b style="color:white">b</b>c</div>
d<b id="&quot;">ef \{da<i>ta.d</i></b><i>ef\}*</i><br>
<div>ghi</div>
<p></p>`
const htmlExpected = `aaa
<div>a<b style="color:white">b</b>c</div>
d<b id="&quot;">ef 123<i></i></b><i>*</i><br>
<div>ghi</div>
<p></p>`
	const data = { def: '123' }
	const helper = new FormulaHelper()
	helper.push('data', data)
	const html2 = await evaluateFormulaInsideHtml(html, helper)
	expect(html2).toBe(htmlExpected)
})


test('TextHtml', async () => {
	const dt: TextHtmlData = {type:'TextHtml', value:'Hello <b>{data.txt}</b>', children:[], font:{}}
	const data = { txt: '123' }
	const p2 = await compileComponent(dt, data)
	expect(p2).toBeTruthy()
	expect(p2.type).toBe('TextHtml')
	const p = p2 as TextHtmlCompiled
	expect(p.value).toBe('Hello <b>123</b>')
})


test('TextHtml should render html', async () => {
	const report: ReportForceChildren<TextHtmlData> = {
		...sampleReport,
		children: [
			{type:'TextHtml', value:'Hello <b>{data.txt}</b>', align:'right', children:[], font:{}}
		]
	}

	const data = { txt: 'world' }
	const compiled = await compile(report, data)
	const html = makeHtml(compiled)
	const component = renderer.create(<>{html}</>)
	const tree = component.toJSON()
  	expect(tree).toMatchSnapshot();
})
