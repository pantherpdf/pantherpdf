/**
 * @file Show name/type of a widget in editor
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React from 'react';
import { TransName } from '../translation';
import { ItemRenderEditorProps, Name } from '../editor/types';
import style from './BoxName.module.css';

export interface BoxNameProps extends ItemRenderEditorProps {
  className?: string;
  name: Name;
  children: React.ReactNode;
  style?: React.CSSProperties;
  visible?: boolean;
}

export default function BoxName(props: BoxNameProps) {
  const cls = style.boxParent + ' ' + (props.className || '');
  return (
    <div className={cls} style={props.style}>
      <div
        className={`${style.name} text-nowrap overflow-hidden ${
          typeof props.visible === 'boolean' && !props.visible ? 'd-none' : ''
        }`}
        draggable={true} /* allways true to allow dragging TextHtml */
        onDragStart={e =>
          props.dragWidgetStart(e, { type: 'wid', wid: props.wid })
        }
        onDragEnd={e => props.dragWidgetEnd(e)}
      >
        {TransName(props.name)}
      </div>
      {props.children}
    </div>
  );
}
