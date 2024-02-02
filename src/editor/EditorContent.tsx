/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import React from 'react';
import Typography from '@mui/material/Typography';
import { defaultReportCss } from '../types';
import { LoadGoogleFontCss } from '../widgets/GoogleFonts';
import {
  PropertyFontExtractStyle,
  PropertyFontGenCss,
} from '../widgets/PropertyFont';
import type { GeneralProps } from './types';
import trans from '../translation';

export default function EditorContent(props: GeneralProps) {
  const style = {
    ...defaultReportCss,
    ...PropertyFontGenCss(props.report.properties.font || {}),
  };
  const fontStyle = props.report.properties.font
    ? PropertyFontExtractStyle(props.report.properties.font)
    : undefined;
  if (fontStyle) {
    LoadGoogleFontCss(fontStyle);
  }
  const width = props.report.properties.paper?.width || 210;
  style.maxWidth = `${(width * 800) / 210}px`;
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
