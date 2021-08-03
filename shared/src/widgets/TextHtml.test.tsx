/**
 * @jest-environment node
 */

import { TextHtml, TextHtmlData, TextHtmlCompiled, evaluateFormulaInsideHtml } from './TextHtml'
import { Helper } from '../editor/compile'

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
	const helper = new Helper()
	helper.push('data', data)
	const html2 = await evaluateFormulaInsideHtml(html, helper)
	expect(html2).toBe(htmlExpected)
})



test('TextHtml', async () => {
	const dt: TextHtmlData = {type:'TextHtml', value:'Hello <b>{data.txt}</b>', children:[], font:{}}

	const data = { txt: '123' }
	const helper = new Helper()
	helper.push('data', data)

	const p2 = await TextHtml.compile(dt, helper)
	expect(p2).toBeTruthy()
	expect(p2.type).toBe('TextHtml')
	const p = p2 as TextHtmlCompiled
	expect(p.value).toBe('Hello <b>123</b>')
})
