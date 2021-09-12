/**
 * @jest-environment jsdom
 */

import { TextSimpleData } from './TextSimple'
import { RepeatData } from './Repeat'
import compile, { compileComponent } from '../editor/compile'
import { ForceChildren } from '../editor/types'
import { sampleReport } from '../editor/sampleReport'
import { TReport } from '../types'
import { TextHtmlData } from './TextHtml'
import { makeHtmlContent } from '../editor/makeHtml'
import renderer from 'react-test-renderer'


test('text', async () => {
	const dt: ForceChildren<RepeatData|TextSimpleData> = {type:'Repeat', varName:'rp', source:'data.arr + ["a","b"]', direction:'rows', children:[
		{type:'TextSimple', formula:'rp', children:[]}
	]}
	const data = { arr:['1','2'] }
	const p = await compileComponent(dt, data) as any
	expect(p).toBeTruthy()
	expect(p.type).toBe('Repeat')
	expect(p.children[0][0].data).toBe('1')
	expect(p.children[1][0].data).toBe('2')
	expect(p.children[2][0].data).toBe('a')
	expect(p.children[3][0].data).toBe('b')
})


test('complete rows', async () => {
	const txt: TextHtmlData = { type: 'TextHtml', value: '<data>item</data>', font:{}, children:[] }
	const rpt: RepeatData = { type: 'Repeat', children: [txt], source: '[1,2,3,4,5]', varName: 'item', direction: 'rows' }
	const report: TReport = {...sampleReport, children: [rpt] }
	const report2 = await compile(report, {})
	
	expect(report2.children[0].type).toBe('Repeat')
	expect(report2.children[0].children.length).toBe(5)
	expect(Array.isArray(report2.children[0].children[0])).toBeTruthy()
	expect(report2.children[0].children[0][0].type).toBe('TextHtml')
	expect(report2.children[0].children[0][0].value).toBe('1')

	const html = makeHtmlContent(report2)
	const component = renderer.create(<>{html}</>)
	const tree = component.toJSON()
  	expect(tree).toMatchSnapshot();
})


test('complete grid', async () => {
	const txt: TextHtmlData = { type: 'TextHtml', value: '<data>item</data>', font:{}, children:[] }
	const rpt: RepeatData = { type: 'Repeat', children: [txt], source: '[1,2,3,4,5]', varName: 'item', direction: 'grid' }
	const report: TReport = {...sampleReport, children: [rpt] }
	const report2 = await compile(report, {})

	expect(report2.children[0].type).toBe('Repeat')
	expect(report2.children[0].children.length).toBe(5)
	expect(Array.isArray(report2.children[0].children[0])).toBeTruthy()
	expect(report2.children[0].children[0][0].type).toBe('TextHtml')
	expect(report2.children[0].children[0][0].value).toBe('1')

	const html = makeHtmlContent(report2)
	const component = renderer.create(<>{html}</>)
	const tree = component.toJSON()
  	expect(tree).toMatchSnapshot();
})
