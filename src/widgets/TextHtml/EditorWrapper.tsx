import React from 'react';
import { LoadGoogleFontCss } from '../GoogleFonts';
import { PropertyFontExtractStyle, PropertyFontGenCss } from '../PropertyFont';
import WidgetEditorName from '../WidgetEditorName';
import { WidgetEditorProps } from '../types';
import Editor from './Editor';
import { type TextHtmlData } from './TextHtml';
import {
  valueInternalFromEditor,
  valueInternalToEditor,
} from './internalRepresentation';
import { idCmp } from '../../editor/childrenMgmt';
import { name } from './options';

export default function EditorWrapper(props: WidgetEditorProps) {
  const item = props.item as TextHtmlData;
  const css = PropertyFontGenCss(item.font);
  css.minHeight = '20px';
  const font2 = PropertyFontExtractStyle(item.font);
  if (font2) {
    LoadGoogleFontCss(font2);
  }

  return (
    <WidgetEditorName
      {...props}
      name={name}
      visible={!props.selected || !idCmp(props.selected, props.wid)}
    >
      <div
        onClick={e => {
          e.stopPropagation();
          const isSelected =
            JSON.stringify(props.selected) === JSON.stringify(props.wid);
          if (!isSelected) {
            props.setSelected(props.wid);
          }
        }}
      >
        <Editor
          wid={props.wid}
          value={valueInternalToEditor(item.value)}
          onChange={val =>
            props.setItem({ ...item, value: valueInternalFromEditor(val) })
          }
          style={css}
          active={!!props.selected && idCmp(props.wid, props.selected)}
        />
      </div>
    </WidgetEditorName>
  );
}
