/**
 * @jest-environment node
 */

import { TextSimpleData } from './TextSimple'
import { ConditionCompiled, ConditionData } from '../widgets/Condition'
import { ForceChildren } from '../editor/types'
import { compileComponent } from '../editor/compile'

test('Condition should show children when formula is truthy', async () => {
	const dt: ForceChildren<ConditionData|TextSimpleData> = {type:'Condition', formula:'1+1', children:[
		{type:'TextSimple', formula:'"hello"', children:[]}
	]}
	const data = { arr:['1','2'] }
	const p = await compileComponent(dt, data) as ConditionCompiled
	expect(p.children.length).toBe(1)
})

test('Condition should show no childs when empty formula', async () => {
	const dt: ForceChildren<ConditionData|TextSimpleData> = {type:'Condition', formula:'', children:[
		{type:'TextSimple', formula:'"hello"', children:[]}
	]}
	const data = { arr:['1','2'] }
	const p = await compileComponent(dt, data) as ConditionCompiled
	expect(p.children.length).toBe(0)
})
