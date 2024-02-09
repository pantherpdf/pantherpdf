/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

// manual tests:
// - widget not selected, try to drag it. It should not be draggable, however it should select text
// - type some text, then wait few sec to periodicaly save, the cursor should stay on same place
// - insert tag, delete nbsp space after tag and press enter

import React from 'react';
import type { WidgetItem, WidgetCompiled, Widget } from '../types';
import { PropertyFontGenCss, TFont } from '../PropertyFont';
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import trans from '../../translation';
import PropertiesEditor from './PropertiesEditor';
import { TextHtmlDataValue } from './internalRepresentation';
import { escapeHtml } from './helpers';
import { name } from './options';
import compile from './compile';
import EditorWrapper from './EditorWrapper';

export interface TextHtmlData extends WidgetItem {
  type: 'TextHtml';
  value: TextHtmlDataValue[];
  font: TFont;
}

export interface TextHtmlCompiled extends WidgetCompiled {
  type: 'TextHtml';
  value: string;
  font: TFont;
}

export const TextHtml: Widget = {
  id: 'TextHtml',
  name,
  icon: faAlignLeft,

  newItem: async (props): Promise<TextHtmlData> => {
    const valueTxt = `<div>${escapeHtml(
      trans('TextHtml initial value'),
    )}</div>`;
    const value: TextHtmlDataValue[] =
      props.report.widgets.length > 0
        ? [{ type: 'html', value: valueTxt }]
        : [];
    return {
      type: 'TextHtml',
      children: [],
      value,
      font: {},
    };
  },

  compile,

  Editor: EditorWrapper,

  Preview: function (props) {
    const item = props.item as TextHtmlCompiled;
    const css = PropertyFontGenCss(item.font);
    return <div style={css} dangerouslySetInnerHTML={{ __html: item.value }} />;
  },

  Properties: PropertiesEditor,

  canDrag: false,
};
