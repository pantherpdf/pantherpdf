/**
 * @file Compiled report -> html
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { CSSProperties } from 'react';
import { renderToString } from 'react-dom/server';
import { defaultReportCss, ReportCompiled } from '../types';
import type { ItemRenderPreviewHelper, Widget } from './types';
import { getWidget } from '../widgets/allWidgets';
import { PropertyFontGenCss } from '../widgets/PropertyFont';
import { GoogleFontUrlImport } from '../widgets/GoogleFonts';

export function renderBody(
  report: ReportCompiled,
  widgets: Widget[],
  externalHelpers: { [key: string]: any } = {},
): React.ReactElement {
  const helper: ItemRenderPreviewHelper = {
    renderItem: (item, helper) => {
      const w = getWidget(widgets, item.type);
      return w.RenderPreview({ ...helper, item });
    },
    renderChildren: (chs, helper) => {
      if (!Array.isArray(chs)) {
        throw new Error('Bad childs array');
      }
      return chs.map((item, idx) => {
        const w = getWidget(widgets, item.type);
        return (
          <React.Fragment key={idx}>
            {w.RenderPreview({ ...helper, item })}
          </React.Fragment>
        );
      });
    },
    externalHelpers,
  };

  const children = helper.renderChildren(report.children, helper);

  // prepare css
  const cssObj: CSSProperties = {
    ...defaultReportCss,
    ...PropertyFontGenCss(report.properties.font || {}),
  };
  return <body style={cssObj}>{children}</body>;
}

export default function renderToHtml(
  report: ReportCompiled,
  widgets: Widget[],
  externalHelpers: { [key: string]: any } = {},
): string {
  // render content
  const bodyElement = renderBody(report, widgets, externalHelpers);
  const bodyTxt = renderToString(bodyElement);

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
${report.globalCss}
</style>
${fontHtml}
</head>
${bodyTxt}
</html>
`;
  return html;
}
