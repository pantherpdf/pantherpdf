/**
 * @jest-environment jsdom
 */

import { TextHtmlData, TextHtmlCompiled, evaluateFormulaInsideHtml } from './TextHtml'
import compile, { compileComponent, FormulaHelper } from '../editor/compile'
import { makeHtmlContent } from '../editor/makeHtml'
import renderer from 'react-test-renderer'
import { ReportForceChildren } from '../editor/types'
import { sampleReport } from '../editor/sampleReport'

test('parse TextHtml formula', async () => {
const html = `aaa
<div>a<b style="color:white">b</b>c</div>
d<b id="&quot;">ef</b> <data><i></i><b>d</b>ata.def</data><br/>
<div>ghi</div>
<p></p>`
const htmlExpected = `aaa
<div>a<b style="color:white">b</b>c</div>
d<b id="&quot;">ef</b> <b>123</b><br>
<div>ghi</div>
<p></p>`
	const data = { def: '123' }
	const helper = new FormulaHelper()
	helper.push('data', data)
	const html2 = await evaluateFormulaInsideHtml(html, helper, undefined)
	expect(html2).toBe(htmlExpected)
})


test('TextHtml 2', async () => {
	const dt: TextHtmlData = {type:'TextHtml', value:'Hello <data><i></i><b>data.txt</b></data>', children:[], font:{}}
	const data = { txt: '123' }
	const p2 = await compileComponent(dt, data)
	expect(p2).toBeTruthy()
	expect(p2.type).toBe('TextHtml')
	const p = p2 as TextHtmlCompiled
	expect(p.value).toBe('Hello <b>123</b>')
})


test('TextHtml Filter', async () => {
	const dt: TextHtmlData = {type:'TextHtml', value:'Hello <data data-adjust="num, 2 dec">data.num</data>', children:[], font:{}}
	const data = { num: 123.123456789 }
	const p2 = await compileComponent(dt, data)
	expect(p2).toBeTruthy()
	expect(p2.type).toBe('TextHtml')
	const p = p2 as TextHtmlCompiled
	expect(p.value).toBe('Hello 123.12')
})


test('TextHtml should render html', async () => {
	const report: ReportForceChildren<TextHtmlData> = {
		...sampleReport,
		children: [
			{type:'TextHtml', value:'Hello <b>world</b>', children:[], font:{size: '20px'}}
		]
	}
	const compiled = await compile(report, {})
	const html = makeHtmlContent(compiled)
	const component = renderer.create(<>{html}</>)
	const tree = component.toJSON()
  	expect(tree).toMatchSnapshot();
})
