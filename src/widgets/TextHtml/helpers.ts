/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import { editorGet } from './listOfEditors';
import { tagType } from './options';

// return first parent tag
// node is usualy text
export function getTagFromSelection(
  node: Node,
  editor: HTMLElement,
): HTMLElement | null {
  if (node === editor) {
    return null;
  }
  if (node.nodeName.toLowerCase() === tagType.toLowerCase()) {
    return node as HTMLElement;
  }
  if (node.parentNode) {
    return getTagFromSelection(node.parentNode, editor);
  }
  return null;
}

// make number path from editor to child node
export function getPidFromNode(node: Node, editor: HTMLElement): number[] {
  const arr: number[] = [];
  while (node !== editor) {
    const parent = node.parentNode;
    if (!parent) {
      throw new Error('Cant find pid 1');
    }
    let found = false;
    for (let i = 0; i < parent.childNodes.length; ++i) {
      if (parent.childNodes[i] === node) {
        arr.push(i);
        found = true;
      }
    }
    if (!found) {
      throw new Error('Cant find pid 2');
    }
    node = parent;
  }
  arr.reverse();
  return arr;
}

// return nth child of editor
export function getNodeFromPid(
  ids: number[],
  editor: HTMLElement,
): Node | null {
  let base: Node = editor;
  for (const idx of ids) {
    if (idx >= base.childNodes.length) {
      return null;
    }
    base = base.childNodes[idx];
  }
  return base;
}

export function insertTag(wid: number[]) {
  const editor = editorGet(wid);
  if (!editor || !editor.elementRef) {
    return;
  }
  const selectedNode = getNodeFromPid(editor.selectedNode, editor.elementRef);
  if (!selectedNode || !selectedNode.parentNode) {
    return;
  }
  const parentNode = selectedNode.parentNode;

  // is inside tag?
  {
    let el: Node | null = selectedNode;
    while (el) {
      if (el.nodeName.toLowerCase() === tagType.toLowerCase()) {
        return;
      }
      el = el.parentNode;
    }
  }

  const btn = document.createElement(tagType.toUpperCase());
  btn.setAttribute('data-adjust', '');
  const btnValue = 'data';
  const btnTextNode = document.createTextNode(btnValue);
  btn.appendChild(btnTextNode);

  if (selectedNode.nodeName === '#text') {
    const txtBefore =
      selectedNode.nodeValue?.substring(0, editor.selectedOffset) || '';
    const txtAfter =
      (selectedNode.nodeValue?.substring(editor.selectedOffset) || '') +
      '\u00a0'; // &nbsp;
    const nextSib = selectedNode.nextSibling;
    selectedNode.nodeValue = txtBefore;
    parentNode.insertBefore(btn, nextSib);
    parentNode.insertBefore(document.createTextNode(txtAfter), nextSib);
  }
  //
  else if (selectedNode === editor.elementRef) {
    selectedNode.appendChild(btn);
    selectedNode.appendChild(document.createTextNode('\u00a0'));
  }
  //
  else {
    const nextSib = selectedNode.nextSibling;
    parentNode.insertBefore(btn, nextSib);
    parentNode.insertBefore(document.createTextNode('\u00a0'), nextSib);
  }

  // select
  const range = document.createRange();
  range.setStart(btnTextNode, 0);
  range.setEnd(btnTextNode, btnValue.length);
  range.collapse(true);
  const s = window.getSelection();
  if (s) {
    s.removeAllRanges();
    s.addRange(range);
  }
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
