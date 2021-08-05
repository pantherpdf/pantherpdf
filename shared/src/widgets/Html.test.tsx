/**
 * @jest-environment node
 */

import { Html, HtmlData, HtmlCompiled } from './Html'
import compile, { Helper } from '../editor/compile'
import makeHtml from '../editor/makeHtml'
import renderer from 'react-test-renderer'
import { sampleReport } from '../editor/sampleReport'
import { ReportForceChildren } from '../editor/types'


test('Html compile', async () => {
	const dt: HtmlData = {type:'Html', formula:'data.desc', children:[]}

	const obj = { desc: '<p>Hello</p>' }
	const helper = new Helper()
	helper.push('data', obj)

	const p2 = await Html.compile(dt, helper)
	expect(p2).toBeTruthy()
	expect(p2.type).toBe('Html')
	const p = p2 as HtmlCompiled
	expect(p.data).toBe('<p>Hello</p>')
})


test('html render', async () => {
	const report: ReportForceChildren<HtmlData> = {
		...sampleReport,
		children: [
			{type:'Html', formula:'data.desc', children:[]},
		]
	}

	const data = { desc: '<p>Hello</p>' }
	const compiled = await compile(report, data)
	const html = makeHtml(compiled)
	const component = renderer.create(<>{html}</>)
	const tree = component.toJSON()
  	expect(tree).toMatchSnapshot();
})


test('Html formula==null should be empty string', async () => {
	const dt: HtmlData = {type:'Html', formula:'data.dt', children:[]}
	const helper = new Helper()
	helper.push('data', { dt: null })
	const p2 = await Html.compile(dt, helper)
	expect(p2.data).toBe('')
})

test('Html formula==false should be empty string', async () => {
	const dt: HtmlData = {type:'Html', formula:'data.dt', children:[]}
	const helper = new Helper()
	helper.push('data', { dt: false })
	const p2 = await Html.compile(dt, helper)
	expect(p2.data).toBe('')
})

test('Html formula==undefined should be empty string', async () => {
	const dt: HtmlData = {type:'Html', formula:'data.dt', children:[]}
	const helper = new Helper()
	helper.push('data', { dt: undefined })
	const p2 = await Html.compile(dt, helper)
	expect(p2.data).toBe('')
})

test('Html formula==0 should be "0"', async () => {
	const dt: HtmlData = {type:'Html', formula:'data.dt', children:[]}
	const helper = new Helper()
	helper.push('data', { dt: 0 })
	const p2 = await Html.compile(dt, helper)
	expect(p2.data).toBe('0')
})
 