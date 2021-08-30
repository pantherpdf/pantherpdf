/**
 * @jest-environment node
 */

import { TextSimpleData } from './TextSimple'
import { RepeatData } from './Repeat'
import { Counter, CounterData } from './Counter'
import { compileComponent } from '../editor/compile'
import { ForceChildren } from '../editor/types'


test('text', async () => {
	const dt: ForceChildren<CounterData|RepeatData|TextSimpleData> =
	{type: 'Counter', varName: 'counter1', children: [
		{type:'Repeat', varName:'rp', source:'["a","b","c"]', direction:'rows', children:[
			{type:'TextSimple', formula:'rp + counter1', children:[]}
		]}
	]}
 
	const obj = { }
 
	const p = await compileComponent(dt, obj)
	expect(p).toBeTruthy()
	expect(p.type).toBe('Counter')
	expect(p.children[0].type).toBe('Repeat')
	expect(p.children[0].children[0][0].data).toBe('a0')
	expect(p.children[0].children[1][0].data).toBe('b1')
	expect(p.children[0].children[2][0].data).toBe('c2')
})
