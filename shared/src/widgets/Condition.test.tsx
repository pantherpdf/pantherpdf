/**
 * @jest-environment node
 */

import { TextSimpleData } from './TextSimple'
import { Condition, ConditionCompiled, ConditionData } from '../widgets/Condition'
import { Helper } from '../editor/compile'
import { ForceChildren } from '../editor/types'

test('Condition should show children when formula is truthy', async () => {
	const dt: ForceChildren<ConditionData|TextSimpleData> = {type:'Condition', formula:'1+1', children:[
		{type:'TextSimple', formula:'"hello"', children:[]}
	]}
	const obj = { arr:['1','2'] }
	const helper = new Helper()
	helper.push('data', obj)

	const p = await Condition.compile(dt, helper) as ConditionCompiled
	expect(p.children.length).toBe(1)
})

test('Condition should show no childs when empty formula', async () => {
	const dt: ForceChildren<ConditionData|TextSimpleData> = {type:'Condition', formula:'', children:[
		{type:'TextSimple', formula:'"hello"', children:[]}
	]}
	const obj = { arr:['1','2'] }
	const helper = new Helper()
	helper.push('data', obj)

	const p = await Condition.compile(dt, helper) as ConditionCompiled
	expect(p.children.length).toBe(0)
})
 