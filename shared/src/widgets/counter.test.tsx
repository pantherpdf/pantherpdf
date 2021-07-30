/**
 * @jest-environment node
 */

import { TextSimpleData, TextSimpleCompiled } from './textSimple'
import { RepeatData, RepeatCompiled } from '../widgets/repeat'
import { counter, CounterData, CounterCompiled } from '../widgets/counter'
import { Helper } from '../editor/compile'
import { ForceChildren } from '../editor/types'



test('text', async () => {
	

	const dt: ForceChildren<CounterData|RepeatData|TextSimpleData> =
	{type: 'counter', varName: 'counter1', children: [
		{type:'repeat', varName:'rp', formula:'["a","b","c"]', children:[
			{type:'textSimple', formula:'rp + counter1', children:[]}
		]}
	]}
 
	const obj = { }
	const helper = new Helper()
	helper.push('obj', obj)
 
	const p = await counter.compile(dt, helper) as any
	expect(p).toBeTruthy()
	expect(p.type).toBe('counter')
	expect(p.children[0].type).toBe('repeat')
	expect(p.children[0].children[0].data).toBe('a0')
	expect(p.children[0].children[1].data).toBe('b1')
	expect(p.children[0].children[2].data).toBe('c2')
})
