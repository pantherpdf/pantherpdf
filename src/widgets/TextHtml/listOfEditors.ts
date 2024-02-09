/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import { idCmp } from '../../editor/childrenMgmt';
import type Editor from './Editor';

const listOfEditors: Editor[] = [];
const listOfSelectionCallbacks: (() => void)[] = [];

function editorGet(wid: number[]): Editor | undefined {
  return listOfEditors.find(edt => idCmp(edt.props.wid, wid));
}

if (typeof window !== 'undefined' && window.document) {
  window.document.addEventListener('selectionchange', () => {
    const s = window.getSelection();
    const anchorNode = s ? s.anchorNode : null;
    const anchorOffset = s ? s.anchorOffset : 0;
    function getEditorByEditor(node: Node) {
      // keep function outside of loop
      // https://eslint.org/docs/rules/no-loop-func
      return listOfEditors.find(edt => edt.elementRef === node);
    }
    let editor: Editor | undefined = undefined;
    let node = anchorNode;
    while (node) {
      // check if editor
      editor = getEditorByEditor(node);
      if (editor) {
        break;
      }
      // next parent
      node = node.parentNode;
    }
    // reset all
    for (const edt of listOfEditors) {
      if (edt === editor) {
        edt.saveCaret(anchorNode, anchorOffset);
      }
    }
    // callbacks
    for (const cb of listOfSelectionCallbacks) {
      cb();
    }
  });
}

export { listOfEditors, listOfSelectionCallbacks, editorGet };
