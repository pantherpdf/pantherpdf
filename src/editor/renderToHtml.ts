/**
 * @file Compiled report -> html
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import type { CSSProperties } from 'react';
import { defaultReportCss, ReportCompiled } from '../types';
import type { ItemRenderPreviewHelper, Widget } from './types';
import { getWidget } from '../widgets/allWidgets';
import styleToCssString from 'react-style-object-to-css';
import { PropertyFontGenCss } from '../widgets/PropertyFont';
import { GoogleFontUrlImport } from '../widgets/GoogleFonts';

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderToHtmlContent(
  report: ReportCompiled,
  widgets: Widget[],
  externalHelpers: { [key: string]: any } = {},
) {
  const helper: ItemRenderPreviewHelper = {
    renderItem: (item, helper) => {
      const w = getWidget(widgets, item.type);
      return w.RenderPreview({ ...helper, item });
    },
    renderChildren: (chs, helper) => {
      if (!Array.isArray(chs)) {
        throw new Error('Bad childs array');
      }
      let txt = '';
      for (const item of chs) {
        const w = getWidget(widgets, item.type);
        txt += w.RenderPreview({ ...helper, item });
      }
      return txt;
    },
    escapeHtml,
    styleToStringAttribute: (css: CSSProperties) =>
      escapeHtml(styleToCssString(css).trim()),
    externalHelpers,
  };

  return helper.renderChildren(report.children, helper);
}

export default function renderToHtml(
  report: ReportCompiled,
  widgets: Widget[],
  externalHelpers: { [key: string]: any } = {},
): string {
  // prepare css
  const cssObj: CSSProperties = {
    ...defaultReportCss,
    ...PropertyFontGenCss(report.properties.font || {}),
  };
  const css = styleToCssString(cssObj);

  // render content
  const htmlContent = renderToHtmlContent(report, widgets, externalHelpers);

  const fontUrl = GoogleFontUrlImport(report.fontsUsed);
  const fontHtml = fontUrl
    ? `<link rel="stylesheet" href="${fontUrl}"></link>`
    : '';

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
${fontHtml}
</head>
<body>
${htmlContent}
</body>
</html>
`;
  return html;
}
