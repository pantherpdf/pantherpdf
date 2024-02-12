/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import React, { useEffect, useState } from 'react';
import { WidgetEditorProps } from '../types';
import { TextHtmlData } from './TextHtml';
import PropertyFont from '../PropertyFont';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import trans, { trKeys, transName } from '../../translation';
import {
  IconDefinition,
  faAlignCenter,
  faAlignJustify,
  faAlignLeft,
  faAlignRight,
  faBold,
  faItalic,
  faTag,
  faUnderline,
} from '@fortawesome/free-solid-svg-icons';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Secondary from '../../components/Secondary';
import SectionName from '../../components/SectionName';
import Button from '@mui/material/Button';
import InputApplyOnEnter, {
  inputFAdornment,
} from '../../components/InputApplyOnEnter';
import { listOfAdjusts } from '../formulaAdjust';
import { editorGet, listOfSelectionCallbacks } from './listOfEditors';
import { tagType } from './options';
import {
  getNodeFromPid,
  getPidFromNode,
  getTagFromSelection,
  insertTag,
} from './helpers';

export default function PropertiesEditor(props: WidgetEditorProps) {
  const item = props.item as TextHtmlData;
  return (
    <>
      <PropertyFont
        api={props.api}
        value={item.font}
        onChange={val => props.setItem({ ...props.item, font: val })}
      />
      <Divider />
      <ToggleButtonGroup
        value={[]}
        onChange={(e, newVal: string[]) => {
          document.execCommand(newVal[0]);
        }}
      >
        {alignOpt.map(x => (
          <ToggleButton
            key={x.command}
            value={x.command}
            aria-label={trans(x.transKey)}
          >
            <FontAwesomeIcon icon={x.icon} fixedWidth />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <ToggleButtonGroup
        value={[]}
        onChange={(e, newVal: string[]) => {
          document.execCommand(newVal[0]);
        }}
      >
        {textStyleOpt.map(x => (
          <ToggleButton
            key={x.command}
            value={x.command}
            aria-label={trans(x.transKey)}
          >
            <FontAwesomeIcon icon={x.icon} fixedWidth />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <TextField
        select
        label={trans('font-size')}
        value=""
        onChange={e => {
          const val = `${e.target.value}pt`;
          const editor = editorGet(props.wid);
          if (val.length === 0 || !editor || !editor.elementRef) {
            return;
          }
          document.execCommand('fontSize', false, '7');
          const fontElements = document.getElementsByTagName('font');
          for (let i = 0, len = fontElements.length; i < len; ++i) {
            const el = fontElements[i];
            if (!isNodeInside(el, editor.elementRef)) {
              continue;
            }
            if (el.size === '7') {
              el.removeAttribute('size');
              el.style.fontSize = val;
            }
          }
          // Immediately apply due to manual changes
          editor.sendChanges(true);
        }}
        id="TextHtml-fontSize"
        sx={{ maxWidth: '5rem' }}
        title={trans('font-size')}
      >
        <MenuItem value="">
          <Secondary>{trans('inherit')}</Secondary>
        </MenuItem>
        {['8', '10', '12', '14', '16', '18', '24', '36'].map(x => (
          <MenuItem key={x} value={x}>
            {x}
          </MenuItem>
        ))}
      </TextField>

      <TagEditorContainer {...props} />
    </>
  );
}

function TagEditorContainer(props: WidgetEditorProps) {
  return (
    <>
      <SectionName text={trans('tag')} />
      <Button
        color="secondary"
        variant="outlined"
        title={trans('insert tag')}
        draggable="true"
        onDragStart={e => {
          e.dataTransfer.setData('text/plain', 'insert-tag');
        }}
        onClick={() => insertTag(props.wid)}
        startIcon={<FontAwesomeIcon icon={faTag} />}
      >
        {trans('insert tag')}
      </Button>
      <TagEditor {...props} />
    </>
  );
}

// is node an indirect child of parent
function isNodeInside(node: Node, parent: Node): boolean {
  if (node === parent) {
    return true;
  }
  if (node.parentNode && isNodeInside(node.parentNode, parent)) {
    return true;
  }
  return false;
}

function TagEditor(props: WidgetEditorProps) {
  const [btnId, setBtnId] = useState<number[] | null>(null);

  // subscribe to selection change
  useEffect(() => {
    function selectionChanged() {
      setBtnId(getSelectedTagPid(props.wid));
    }
    selectionChanged();
    listOfSelectionCallbacks.push(selectionChanged);
    return () => {
      const idx = listOfSelectionCallbacks.indexOf(selectionChanged);
      if (idx !== -1) {
        listOfSelectionCallbacks.splice(idx, 1);
      }
    };
  }, [props.wid]);

  // get <?>
  const editor = editorGet(props.wid);
  if (!btnId || !editor || !editor.elementRef) {
    return null;
  }
  const btnTmp = getNodeFromPid(btnId, editor.elementRef);
  if (!btnTmp || btnTmp.nodeName.toLowerCase() !== tagType.toLowerCase()) {
    return null;
  }
  const btn = btnTmp as HTMLElement;

  return (
    <>
      {/* FORMULA */}
      <InputApplyOnEnter
        component={TextField}
        id="tag-value"
        value={btn.innerText}
        onChange={val => {
          btn.innerText = val;
          editor.sendChanges(true);
        }}
        label={trans('source data')}
        InputProps={inputFAdornment}
      />

      {/* ADJUST */}
      <TextField
        select
        value={btn.getAttribute('data-adjust') || ''}
        onChange={e => {
          btn.setAttribute('data-adjust', e.target.value);
          editor.sendChanges(true);
        }}
        id="tag-adjust"
        label={trans('adjust')}
      >
        <MenuItem value=""></MenuItem>
        {adjustOptionsWithSeparatos().map(flt =>
          flt.key.startsWith('separator-') ? (
            <MenuItem disabled key={flt.key}>
              ──────────
            </MenuItem>
          ) : (
            <MenuItem value={flt.key} key={flt.key}>
              {flt.value}
            </MenuItem>
          ),
        )}
      </TextField>
    </>
  );
}

// Properties editor for tag
function getSelectedTagPid(wid: number[]): number[] | null {
  const x = editorGet(wid);
  if (!x || !x.elementRef) {
    return null;
  }
  const selected = getNodeFromPid(x.selectedNode, x.elementRef);
  if (!selected) {
    return null;
  }
  const btn = getTagFromSelection(selected, x.elementRef);
  if (!btn) {
    return null;
  }
  return getPidFromNode(btn, x.elementRef);
}

function adjustOptionsWithSeparatos() {
  const arrAdjusts = [...listOfAdjusts].sort((a, b) =>
    a.category <= b.category ? -1 : 1,
  );
  // MUI TextField component does not accept React.Fragment so we need to prepare mixed array of items and separators
  const arrAdjusts2: { key: string; value: string }[] = [];
  let lastCat = '';
  for (const obj of arrAdjusts) {
    if (obj.category !== lastCat && arrAdjusts2.length > 0) {
      arrAdjusts2.push({
        key: `separator-${obj.category}`,
        value: '',
      });
      lastCat = obj.category;
    }
    arrAdjusts2.push({
      key: obj.id,
      value: obj.name ? transName(obj.name) : obj.id,
    });
  }
  return arrAdjusts2;
}

interface AlignOpt {
  command: string;
  icon: IconDefinition;
  transKey: trKeys;
}

const alignOpt: AlignOpt[] = [
  {
    command: 'justifyLeft',
    icon: faAlignLeft,
    transKey: 'align-left',
  },
  {
    command: 'justifyCenter',
    icon: faAlignCenter,
    transKey: 'align-center',
  },
  {
    command: 'justifyRight',
    icon: faAlignRight,
    transKey: 'align-right',
  },
  {
    command: 'justifyFull',
    icon: faAlignJustify,
    transKey: 'align-justify',
  },
];

interface TextStyleOpt {
  command: string;
  icon: IconDefinition;
  transKey: trKeys;
}

const textStyleOpt: TextStyleOpt[] = [
  { command: 'bold', icon: faBold, transKey: 'font-weight-bold' },
  { command: 'italic', icon: faItalic, transKey: 'font-style-italic' },
  {
    command: 'underline',
    icon: faUnderline,
    transKey: 'font-decoration-underline',
  },
];
