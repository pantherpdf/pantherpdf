/**
 * @jest-environment jsdom
 */

import { Frame, FrameData } from './Frame'
import compile from '../editor/compile'
import { sampleReport } from '../editor/sampleReport'
import type { TReport } from '../types'
import { makeHtmlContent } from '../editor/makeHtml'
import type { NewItemProps } from '../editor/types'


test('Frame should include google font', async () => {
	const helper: NewItemProps = { report: sampleReport }
	const el = await Frame.newItem(helper) as FrameData
	el.font.family = 'Lato'
	const report: TReport = {
		...sampleReport,
		children: [el],
	}
	const compiled = await compile(report, {})
	expect(compiled.fontsUsed).toContain('Lato')
})


test('Frame should include page break property', async () => {
	const helper: NewItemProps = { report: sampleReport }
	const el = await Frame.newItem(helper) as FrameData
	el.pageBreakAvoid = true
	const report: TReport = {
		...sampleReport,
		children: [el],
	}
	const compiled = await compile(report, {})
	const html = makeHtmlContent(compiled)
	expect(html.replace(/\s/g,'')).toContain('page-break-inside:avoid')
})


test('Frame should not add whitespace around outer div', async () => {
	const helper: NewItemProps = { report: sampleReport }
	const el = await Frame.newItem(helper) as FrameData
	const report: TReport = {
		...sampleReport,
		children: [el],
	}
	const compiled = await compile(report, {})
	const html = makeHtmlContent(compiled)
	expect(html.trim()).toBe(html)
})
