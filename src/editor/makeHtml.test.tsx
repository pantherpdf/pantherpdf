/**
 * @jest-environment node
 */


import compile from './compile'
import type { ReportForceChildren } from './types'
import type { TextSimpleData } from '../widgets/TextSimple'
import { sampleReport } from './sampleReport'
import makeHtml from './makeHtml'
import renderer from 'react-test-renderer'

test('text', async () => {
	const report: ReportForceChildren<TextSimpleData> = {
		...sampleReport,
		children: [
			{type:'TextSimple', formula:'"Hello World: "+data.num', children:[]},
		]
	}

	const obj = { num: 123 }
	const compiled = await compile(report, obj)
	const html = makeHtml(compiled)
	const component = renderer.create(<>{html}</>)
	const tree = component.toJSON()
  	expect(tree).toMatchSnapshot();
})
