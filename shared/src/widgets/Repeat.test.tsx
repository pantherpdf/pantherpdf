/**
 * @jest-environment node
 */

import { TextSimpleData } from './TextSimple'
import { Repeat, RepeatData } from './Repeat'
import { compileComponent } from '../editor/compile'
import { ForceChildren } from '../editor/types'

test('text', async () => {
	const dt: ForceChildren<RepeatData|TextSimpleData> = {type:'Repeat', varName:'rp', source:'data.arr + ["a","b"]', children:[
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
