/**
 * @jest-environment node
 */

import { TextSimpleData } from './TextSimple'
import { Repeat, RepeatData } from './Repeat'
import { Helper } from '../editor/compile'
import { ForceChildren } from '../editor/types'

test('text', async () => {
	const dt: ForceChildren<RepeatData|TextSimpleData> = {type:'Repeat', varName:'rp', source:'data.arr + ["a","b"]', children:[
		{type:'TextSimple', formula:'rp', children:[]}
	]}
	const obj = { arr:['1','2'] }
	const helper = new Helper()
	helper.push('data', obj)
 
	const p = await Repeat.compile(dt, helper) as any
	expect(p).toBeTruthy()
	expect(p.type).toBe('Repeat')
	expect(p.children[0].data).toBe('1')
	expect(p.children[1].data).toBe('2')
	expect(p.children[2].data).toBe('a')
	expect(p.children[3].data).toBe('b')
})
