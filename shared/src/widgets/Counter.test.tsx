/**
 * @jest-environment node
 */

import { TextSimpleData } from './TextSimple'
import { RepeatData } from './Repeat'
import { Counter, CounterData } from './Counter'
import { Helper } from '../editor/compile'
import { ForceChildren } from '../editor/types'


test('text', async () => {
	

	const dt: ForceChildren<CounterData|RepeatData|TextSimpleData> =
	{type: 'Counter', varName: 'counter1', children: [
		{type:'Repeat', varName:'rp', formula:'["a","b","c"]', children:[
			{type:'TextSimple', formula:'rp + counter1', children:[]}
		]}
	]}
 
	const obj = { }
	const helper = new Helper()
	helper.push('obj', obj)
 
	const p = await Counter.compile(dt, helper) as any
	expect(p).toBeTruthy()
	expect(p.type).toBe('Counter')
	expect(p.children[0].type).toBe('Repeat')
	expect(p.children[0].children[0].data).toBe('a0')
	expect(p.children[0].children[1].data).toBe('b1')
	expect(p.children[0].children[2].data).toBe('c2')
})
