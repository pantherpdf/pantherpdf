/**
 * @jest-environment node
 */

import { TextSimpleData } from './TextSimple'
import { FirstMatch, FirstMatchCompiled, FirstMatchData } from '../widgets/FirstMatch'
import { Helper } from '../editor/compile'
import { ForceChildren } from '../editor/types'

test('FirstMatch', async () => {
	const dt: ForceChildren<FirstMatchData|TextSimpleData> = {type:'FirstMatch', array:'[1,2,3,4,5,6]', condition:'match22 > 3', varName: 'match22', children:[
		{type:'TextSimple', formula:'"hello " + match22', children:[]}
	]}
	const data = { }
	const helper = new Helper()
	helper.push('data', data)

	const p = await FirstMatch.compile(dt, helper) as FirstMatchCompiled
	expect(p.children.length).toBe(1)
	expect(p.children[0].data).toBe('hello 4')
})