/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import Typography from '@mui/material/Typography';
import { defaultReportCss } from '../types';
import { LoadGoogleFontCss } from '../widgets/GoogleFonts';
import {
  PropertyFontExtractStyle,
  PropertyFontGenCss,
} from '../widgets/PropertyFont';
import type { GeneralProps } from './types';
import Trans from '../translation';

export default function RenderContentHtml(props: GeneralProps) {
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
  let width = props.report.properties.paper?.width || 210;
  style.maxWidth = `${(width * 800) / 210}px`;
  style.margin = `0 auto`;
  return (
    <div style={style}>
      {props.renderWidgets(props.report.children, [])}
      {props.report.children.length === 0 && (
        <Typography color="GrayText" align="center">
          {Trans('drag drop widgets here')}
        </Typography>
      )}
    </div>
  );
}
