/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import React, { Component, CSSProperties } from 'react';
import { styled } from '@mui/material/styles';
import { listOfEditors, listOfSelectionCallbacks } from './listOfEditors';
import {
  getNodeFromPid,
  getPidFromNode,
  getTagFromSelection,
  insertTag,
} from './helpers';

interface EditorProps {
  style?: CSSProperties;
  wid: number[];
  value: string;
  onChange: (val: string) => void;
  active: boolean;
}
interface EditorState {}

// use class component instead of function - cleaner design
//  * no need to use useRef()
//  * access to shouldComponentUpdate()
export default class Editor extends Component<EditorProps, EditorState> {
  // reference to <div>
  elementRef: HTMLDivElement | null;
  // to know when change is comming from here and when from outside
  currentValueFromProps: string;
  // timeout for callback to save changes
  timerUpdate: number;
  // selection - caret position
  selectedNode: number[];
  selectedOffset: number;

  constructor(props: EditorProps) {
    super(props);
    this.state = {};

    this.elementRef = null;
    this.currentValueFromProps = props.value;
    this.timerUpdate = 0;

    this.selectedNode = [];
    this.selectedOffset = 0;
  }

  componentDidMount() {
    listOfEditors.push(this);
  }

  componentWillUnmount() {
    if (this.timerUpdate) {
      this.sendChanges(true);
    }
    const idx = listOfEditors.indexOf(this);
    if (idx !== -1) {
      listOfEditors.splice(idx, 1);
    }
  }

  applyUpdates(el: HTMLDivElement, props: EditorProps, force: boolean) {
    // data-wid
    const widStr = props.wid.map(x => String(x)).join(',');
    el.setAttribute('data-wid', widStr);

    // style
    el.removeAttribute('style');
    if (props.style) {
      Object.assign(el.style, props.style);
    }
    // padding to separate content from outline (when it has focus), to show cursor
    el.style.padding = '1px 3px';

    // html
    if (props.value !== this.currentValueFromProps || force) {
      el.innerHTML = props.value;
      this.currentValueFromProps = props.value;
      this.saveCaret(null, 0);
    }
  }

  setElementRef(el: HTMLDivElement | null) {
    if (el === this.elementRef) {
      return;
    }
    if (el) {
      // update <div>
      this.applyUpdates(el, this.props, true);
    }
    this.elementRef = el;
  }

  shouldComponentUpdate(nextProps: EditorProps): boolean {
    if (this.elementRef) {
      this.applyUpdates(this.elementRef, nextProps, false);
    }
    // never re-render
    return false;
  }

  saveCaret(node: Node | null, offset: number): void {
    const newNode =
      node && this.elementRef ? getPidFromNode(node, this.elementRef) : [];
    // is same?
    if (this.selectedNode === newNode && this.selectedOffset === offset) {
      return;
    }
    // update
    this.selectedNode = newNode;
    this.selectedOffset = offset;
    for (const cb of listOfSelectionCallbacks) {
      cb();
    }
  }

  editorInput(e: React.FormEvent<HTMLDivElement>) {
    e.stopPropagation();
    // set timer to update after few seconds
    if (this.timerUpdate > 0) {
      clearTimeout(this.timerUpdate);
      this.timerUpdate = 0;
    }
    const tm = window.setTimeout(this.sendChanges.bind(this), 3000, false);
    this.timerUpdate = tm;
  }

  sendChanges(cleanHtml: boolean) {
    // callback from timer
    if (this.timerUpdate) {
      clearTimeout(this.timerUpdate);
      this.timerUpdate = 0;
    }
    if (!this.elementRef) {
      return;
    }
    // change
    const val = this.elementRef.innerHTML;
    if (val === this.currentValueFromProps) {
      return;
    }
    if (cleanHtml) {
      // todo sanitize
      // todo remove empty tag
      // todo remove nbsp at end of line
      // todo remove tags like <span style="white-space: nowrap;">new real text</span>
      // todo remove style padding, margin, ...
      if (val === this.currentValueFromProps) {
        return;
      }
    }
    this.currentValueFromProps = val;
    this.props.onChange(val);
  }

  editorKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
    e.stopPropagation();
    // when user presses enter, manually add new line to prevent adding new line inside tag
    if (e.key !== 'Enter') {
      return;
    }
    if (!this.elementRef) {
      return;
    }
    const node = getNodeFromPid(this.selectedNode, this.elementRef);
    if (!node) {
      return;
    }
    const btn = getTagFromSelection(node, this.elementRef);
    if (!btn || !btn.parentElement) {
      return;
    }
    // add new line after <?>
    e.preventDefault();
    const el = document.createElement('div');
    const nodeTxt = document.createTextNode('\u00a0');
    el.appendChild(nodeTxt);
    btn.parentElement.insertBefore(el, btn.nextSibling);
    // move caret
    const range = document.createRange();
    range.setStart(nodeTxt, 0);
    range.setEnd(nodeTxt, 1);
    range.collapse(true);
    const s = window.getSelection();
    if (s) {
      s.removeAllRanges();
      s.addRange(range);
    }
  }

  // hack for safari
  // without removing draggable, text selection doesnt work
  // https://stackoverflow.com/questions/6399131/html5-draggable-and-contenteditable-not-working-together
  parentsRemoveDraggable(el: HTMLElement | null) {
    while (el) {
      if (el.draggable) {
        el.draggable = false;
        el.setAttribute('data-draggable', '1');
      }
      el = el.parentElement;
    }
  }

  parentsRestoreDraggable(el: HTMLElement | null) {
    while (el) {
      if (el.getAttribute('data-draggable') === '1') {
        el.draggable = true;
        el.removeAttribute('data-draggable');
      }
      el = el.parentElement;
    }
  }

  dropTag(e: React.DragEvent<HTMLDivElement>) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/caretRangeFromPoint
    // https://jsfiddle.net/fpkjbech/
    e.preventDefault();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const document_ = document as any;
    const e_ = e as any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    let node: Node;
    let offset: number;
    e.currentTarget.focus();
    if (document_.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (!range) {
        return;
      }
      node = range.startContainer;
      offset = range.startOffset;
    }
    //
    else if (document_.caretPositionFromPoint) {
      const range = document_.caretPositionFromPoint(e.clientX, e.clientY);
      if (!range) {
        return;
      }
      node = range.offsetNode;
      offset = range.offset;
    }
    //
    else if (e_.rangeParent) {
      const range = document.createRange();
      range.setStart(e_.rangeParent, e_.rangeOffset);
      node = range.startContainer;
      offset = range.startOffset;
    }
    //
    else {
      // not supported
      return;
    }
    // update selection
    if (!node || !this.elementRef) {
      return;
    }
    this.selectedNode = getPidFromNode(node, this.elementRef);
    this.selectedOffset = offset;
    for (const cb of listOfSelectionCallbacks) {
      cb();
    }
    // editor
    const widStr = e.currentTarget.getAttribute('data-wid');
    if (!widStr || widStr.length === 0) {
      return;
    }
    const wid = widStr.split(',').map(x => parseInt(x));
    // insert
    insertTag(wid);
  }

  render() {
    return (
      <TextHtmlEditor
        ref={this.setElementRef.bind(this)}
        contentEditable
        draggable
        onDragStart={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onKeyDown={this.editorKeyDown.bind(this)}
        onInput={this.editorInput.bind(this)}
        onFocus={e => {
          this.parentsRemoveDraggable(e.currentTarget);
        }}
        onBlur={e => {
          this.parentsRestoreDraggable(e.currentTarget);
          this.sendChanges(true);
        }}
        onDrop={e => {
          const dt = e.dataTransfer.getData('text/plain');
          if (dt === 'insert-tag') {
            this.dropTag(e);
          }
        }}
      />
    );
  }
}

const TextHtmlEditor = styled('div')({
  borderRadius: '0.15rem',

  '&:focus-visible': {
    boxShadow: '0 0 3pt 2pt rgba(100,149,237,0.7)',
    outline: 'none',
  },

  '& data': {
    display: 'inline-block',
    cursor: 'pointer',
    outline: 'none',
    border: '1px solid #949ea8',
    borderRadius: '0.2rem',
    color: 'inherit',
    padding: '0 0.05rem',
    backgroundColor: 'inherit',
    fontWeight: 'inherit',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    fontStyle: 'inherit',
    textAlign: 'inherit',
    maxWidth: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    verticalAlign: 'top',
  },
});
