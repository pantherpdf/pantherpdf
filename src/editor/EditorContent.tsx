/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import React, { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { defaultReportCss } from '../types';
import { propertyFontGenCss } from '../widgets/PropertyFont';
import type { GeneralProps } from './types';
import trans from '../translation';
import getFontsUsed from '../data/getFontsUsed';

export default function EditorContent(props: GeneralProps) {
  useEffect(() => {
    const fontsUsed = getFontsUsed(props.report, props.widgets);
    const urls = props.api.fonts?.getCssUrls(fontsUsed) || [];
    loadFonts(urls);
  });
  const style = {
    ...defaultReportCss,
    ...propertyFontGenCss(props.report.properties.font || {}),
  };
  const screenWidth = calcPaperScreenSize(props.report.properties.paper?.width);
  style.maxWidth = `${screenWidth.max}px`;
  style.minWidth = `${screenWidth.min}px`;
  style.margin = `0 auto`;
  return (
    <div style={style}>
      {props.renderWidgets(props.report.widgets, [])}
      {props.report.widgets.length === 0 && (
        <Typography color="GrayText" align="center">
          {trans('drag drop widgets here')}
        </Typography>
      )}
    </div>
  );
}

const loadedUrls: string[] = [];
function loadFonts(urls: string[]): void {
  for (const url of urls) {
    if (loadedUrls.indexOf(url) !== -1) {
      continue;
    }
    loadedUrls.push(url);
    const link = window.document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    window.document.head.appendChild(link);
  }
}

interface PaperScreenWidth {
  max: number;
  min: number;
}

export function calcPaperScreenSize(
  width: number | undefined,
): PaperScreenWidth {
  width = width === undefined ? 210 : width;
  const widthPx = (width * 800) / 210;
  return { max: widthPx, min: widthPx * 0.75 };
}
