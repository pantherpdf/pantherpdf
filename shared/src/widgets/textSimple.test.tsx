/**
 * @jest-environment node
 */

import { textSimple, TextSimpleData, TextSimpleCompiled } from './textSimple'
import { Helper } from '../editor/compile'

test('text', async () => {
	const dt: TextSimpleData = {type:'textSimple', formula:'"Hello World: " + data.txt', children:[]}

	const obj = { txt: '123' }
	const helper = new Helper()
	helper.push('data', obj)

	const p2 = await textSimple.compile(dt, helper)
	expect(p2).toBeTruthy()
	expect(p2.type).toBe('textSimple')
	const p = p2 as TextSimpleCompiled
	expect(p.data).toBe('Hello World: 123')
})
