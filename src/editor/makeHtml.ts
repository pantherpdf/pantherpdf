/**
 * makeHtml.ts
 * Compiled report -> html
 */


import type { CSSProperties } from 'react'
import { defaultReportCss, TReportCompiled } from '../types'
import type { ItemRendeFinalHelper } from './types'
import getWidget from '../widgets/allWidgets'
import styleToCssString from 'react-style-object-to-css'
import { PropertyFontGenCss } from '../widgets/PropertyFont'
import { GoogleFontCssUrl } from '../widgets/GoogleFonts'
import { encodeHtml } from '../widgets/HtmlParser'


function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}


export function makeHtmlContent(report: TReportCompiled, externalHelpers: {[key: string]: any}={}) {
	const helper: ItemRendeFinalHelper = {
		renderItem: (item, helper) => {
			const w = getWidget(item.type)
			return w.RenderFinal({...helper, item})
		},
		renderChildren: (chs, helper) => {
			if (!Array.isArray(chs)) {
				throw new Error('Bad childs array')
			}
			let txt = ''
			for (const item of chs) {
				const w = getWidget(item.type)
				txt += w.RenderFinal({...helper, item})
			}
			return txt
		},
		escapeHtml,
		styleToStringAttribute: (css: CSSProperties) => escapeHtml(styleToCssString(css).trim()),
		externalHelpers,
	}

	return helper.renderChildren(report.children, helper)
}


export default function makeHtml(report: TReportCompiled, externalHelpers: {[key: string]: any}={}): string {
	// prepare css
	const cssObj: CSSProperties = {...defaultReportCss, ...PropertyFontGenCss(report.properties.font || {})}
	const css = styleToCssString(cssObj)

	// render content
	const htmlContent = makeHtmlContent(report, externalHelpers)

	const fonts = new Set(report.fontsUsed)
	const fontUrls = [...fonts]
	.map(x => GoogleFontCssUrl(x) || '')
	.filter(x => x.length > 0)
	.map(x => `<link rel="stylesheet" href="${encodeHtml(x)}">`)
	.join('\n')

	const html = `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Report</title>
<style>
/* http://meyerweb.com/eric/tools/css/reset/ 
   v2.0 | 20110126
   License: none (public domain)
*/
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
	display: block;
}
body {
	line-height: 1.25;
}
ol, ul {
	list-style: none;
}
blockquote, q {
	quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}
/* modifications */
b, strong {
	font-weight: bold;
}
cite, em, i {
	font-style: italic;
}
big {
	font-size: larger;
}
small {
	font-size: smaller;
}
mark {
	background-color: yellow;
}
sub {
    vertical-align: sub;
    font-size: smaller;
}
sup {
    vertical-align: super;
    font-size: smaller;
}
</style>
<style>
* {
	-webkit-print-color-adjust: exact;
	print-color-adjust: exact;
}
</style>
<style>
body {
	${css}
}
${report.globalCss}
</style>
${fontUrls}
</head>
<body>
${htmlContent}
</body>
</html>
`
	return html
}
