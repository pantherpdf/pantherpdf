/**
 * @jest-environment node
 */

import { TextSimpleData } from './TextSimple'
import { SetVar, SetVarCompiled, SetVarData } from '../widgets/SetVar'
import { Helper } from '../editor/compile'
import { ForceChildren } from '../editor/types'

test('SetVar', async () => {
	const dt: ForceChildren<SetVarData|TextSimpleData> = {type:'FirstMatch', source:'data.abc.def', varName: 'ccc', children:[
		{type:'TextSimple', formula:'ccc', children:[]}
	]}
	const data = { abc: { def: '123' } }
	const helper = new Helper()
	helper.push('data', data)

	const p = await SetVar.compile(dt, helper) as SetVarCompiled
	expect(p.children.length).toBe(1)
	expect(p.children[0].data).toBe('123')
})


test('SetVar check that childs of data are not accessible', async () => {
	const dt: ForceChildren<SetVarData|TextSimpleData> = {type:'FirstMatch', source:'data.abc', varName: 'ccc', children:[
		{type:'TextSimple', formula:'abc', children:[]}
	]}
	const data = { abc: { def: '123' } }
	const helper = new Helper()
	helper.push('data', data)

	await expect(SetVar.compile(dt, helper)).rejects.toThrow()
})
