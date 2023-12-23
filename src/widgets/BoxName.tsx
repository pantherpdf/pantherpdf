/**
 * @file Show name/type of a widget in editor
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import { TransName } from '../translation';
import type { ItemRenderEditorProps } from './types';
import type { Name } from '../types';
import { styled } from '@mui/material/styles';

const BoxParent = styled('div')({
  position: 'relative',
  width: '100%',
  padding: '0.1rem 0.2rem',
  border: '1px solid #ddd',

  '&:hover > .PantherPdfBoxName': {
    opacity: '1',
  },
});

const NameDiv = styled('div')({
  position: 'absolute',
  top: '0px',
  left: '0',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  fontSize: '0.5rem',
  lineHeight: '0.75rem',
  fontWeight: 'normal',
  fontStyle: 'normal',
  letterSpacing: '0',
  padding: '0.05rem 0.2rem 0.1rem 0.2rem',
  opacity: '0.3',
  maxWidth: '70%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
});

export interface BoxNameProps extends ItemRenderEditorProps {
  name: Name;
  children: React.ReactNode;
  style?: React.CSSProperties;
  visible?: boolean;
}

export default function BoxName(props: BoxNameProps) {
  return (
    <BoxParent style={props.style}>
      <NameDiv
        className="PantherPdfBoxName"
        style={{
          display:
            typeof props.visible === 'boolean' && !props.visible
              ? 'none'
              : 'inline-block',
        }}
        draggable /* allways true to allow dragging TextHtml */
        onDragStart={e =>
          props.dragWidgetStart(e, { type: 'wid', wid: props.wid })
        }
        onDragEnd={e => props.dragWidgetEnd(e)}
      >
        {TransName(props.name)}
      </NameDiv>
      {props.children}
    </BoxParent>
  );
}
