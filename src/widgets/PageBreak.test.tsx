/**
 * @jest-environment jsdom
 */

import { PageBreak, PageBreakData } from './PageBreak'
import compile from '../editor/compile'
import { sampleReport } from '../editor/sampleReport'
import type { TReport } from '../types'
import { makeHtmlContent } from '../editor/makeHtml'
import ReactDOMServer from 'react-dom/server'
import type { NewItemProps } from '../editor/types'


test('PageBreak should include css page-break-before', async () => {
	const helper: NewItemProps = { report: sampleReport }
	const el = await PageBreak.newItem(helper) as PageBreakData
	const report: TReport = {
		...sampleReport,
		children: [el],
	}
	const compiled = await compile(report, {})
	const html = makeHtmlContent(compiled)
	const htmlContent = ReactDOMServer.renderToStaticMarkup(<>{html}</>)
	expect(htmlContent).toContain('page-break-before:always')
})
