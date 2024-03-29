/**
 * @file Functions for managing children. Mostly for drag-drop support.
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import type { Report } from '../types';
import type { WidgetItem } from '../widgets/types';

export function findArrayInList(report: Report, wid: number[]): WidgetItem[] {
  let arr: WidgetItem[] = report.widgets;
  for (const id of wid) {
    if (id >= arr.length) {
      throw new Error('bad id');
    }
    arr = arr[id].children;
  }
  return arr;
}

export function findInList(report: Report, wid: number[]): WidgetItem {
  if (wid.length === 0) {
    throw new Error('empty wid');
  }
  const wid2 = [...wid];
  const id = wid2.splice(wid2.length - 1, 1)[0];
  const arr = findArrayInList(report, wid2);
  if (id >= arr.length) {
    throw new Error('bad id');
  }
  return arr[id];
}

export function removeFromList(report: Report, wid: number[]): Report {
  if (wid.length === 0) {
    throw new Error('bad wid');
  }

  const r: Report = { ...report, widgets: [...report.widgets] };
  let lst: WidgetItem[] = r.widgets;

  for (let i = 0; i < wid.length; ++i) {
    const id = wid[i];
    if (i + 1 === wid.length) {
      // remove
      if (id >= lst.length) {
        throw new Error('child doesnt exist');
      }
      lst.splice(id, 1);
    } else {
      // copy array
      if (id >= lst.length) {
        throw new Error('child doesnt exist');
      }
      const lst2 = lst[id];
      const lst3 = { ...lst2, children: [...lst2.children] };
      lst[id] = lst3;
      lst = lst3.children;
    }
  }

  return r;
}

export function insertIntoList(
  report: Report,
  wid: number[],
  obj: WidgetItem,
): Report {
  if (wid.length === 0) {
    throw new Error('bad wid');
  }

  const r: Report = { ...report, widgets: [...report.widgets] };
  let lst: WidgetItem[] = r.widgets;

  for (let i = 0; i < wid.length; ++i) {
    const id = wid[i];
    if (i + 1 === wid.length) {
      // add
      if (id >= lst.length + 1) {
        throw new Error('child doesnt exist');
      }
      lst.splice(id, 0, obj);
    } else {
      // copy array
      if (id >= lst.length) {
        throw new Error('child doesnt exist');
      }
      const lst2 = lst[id];
      const lst3 = { ...lst2, children: [...lst2.children] };
      lst[id] = lst3;
      lst = lst3.children;
    }
  }

  return r;
}

export function updateDestAfterRemove(
  dest: number[],
  removed: number[],
): number[] {
  const l = Math.min(dest.length, removed.length);
  if (l === 0) {
    throw new Error('bad wid');
  }
  for (let i = 0; i < l; ++i) {
    const id_d = dest[i];
    const id_r = removed[i];
    if (id_r > id_d) {
      return dest;
    }
    if (id_r < id_d) {
      if (i + 1 === removed.length) {
        const dest2 = [...dest];
        dest2[i] -= 1;
        return dest2;
      }
      return dest;
    }
    if (
      id_r === id_d &&
      i + 1 === removed.length &&
      dest.length > removed.length
    ) {
      throw new Error('delete parent');
    }
  }
  return dest;
}

export function idCmp(id1: number[], id2: number[]): boolean {
  if (id1.length !== id2.length) {
    return false;
  }
  for (let i = 0; i < id1.length; ++i) {
    if (id1[i] !== id2[i]) {
      return false;
    }
  }
  return true;
}

export function updateItem(
  report: Report,
  wid: number[],
  obj: WidgetItem,
): Report {
  const r = { ...report };
  r.widgets = [...r.widgets];
  let chs = r.widgets;
  for (let i = 0; i < wid.length; ++i) {
    const id = wid[i];
    if (id >= chs.length) {
      throw new Error('bad id');
    }
    if (i + 1 === wid.length) {
      // last
      chs[id] = obj;
    } else {
      // copy array
      const c = { ...chs[id] };
      c.children = [...c.children];
      chs[id] = c;
      chs = c.children;
    }
  }
  return r;
}
