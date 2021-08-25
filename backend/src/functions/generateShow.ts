import { Handler } from '@netlify/functions'
import { ObjectId } from 'mongodb';
import connectToDatabase from '../db'
import { PropertyFontGenCss, defaultReportCss } from 'reports-shared'
import styleToCssString from 'react-style-object-to-css'
import type { CSSProperties } from 'react'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'GET') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const accessKey = (event.queryStringParameters && event.queryStringParameters.key) || ''
	if (accessKey.length === 0) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}

	const db = await connectToDatabase()
	const obj = await db.reportsGenerated.findOne({accessKey})
	if (!obj) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}

	const report = await db.reports.findOne({_id: new ObjectId(obj.reportId)})
	if (!report) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Missing report doc'}) }
	}
	const cssObj: CSSProperties = {...defaultReportCss, ...PropertyFontGenCss(report.properties.font || {})}
	const css = styleToCssString(cssObj)
	const modePrint = (event.queryStringParameters && event.queryStringParameters.mode === 'print') || false

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
	line-height: 1;
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
body {
	${css}
}
</style>
</head>
<body>
${!modePrint && '<div style="max-width:800px; border: 2px solid #ddd; padding: 30px; margin: 0 auto">'}
${obj.html}
${!modePrint && '</div>'}
</body>
</html>
`
	
	return {
		statusCode: 200,
		headers: {
			'Content-Type': 'text/html; charset=UTF-8',
		},
		body: html,
	}
};

export { handler };
