/**
 * @file Managing global state, prepare GeneralProps, drag-drop functions
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { ReactNode, useState, useRef, CSSProperties } from 'react';
import { defaultWidgets, getWidget } from '../widgets/allWidgets';
import type { Report, ApiUploadMetaData } from '../types';
import type { EditorProps, GeneralProps, TDragObj } from './types';
import Layout from './EditorLayout';
import {
  findInList,
  removeFromList,
  insertIntoList,
  updateDestAfterRemove,
  idCmp,
  updateItem,
} from './childrenMgmt';
import { extractFiles } from '../FileSelect';
import { Image as ImageWidget, ImageData, apiPrefix } from '../widgets/Image';
import { SourceData } from '../data/fetchSourceData';
import { defaultTransforms } from '../transforms/allTransforms';
import type { WidgetItem, WidgetNewProps } from '../widgets/types';

const styleDragHighlight: CSSProperties = {
  backgroundColor: 'red',
};

const styleSpacer: CSSProperties = {
  height: '0.5rem',
  width: '100%',
};

const styleWidgetBox: CSSProperties = {
  border: '1px dotted #ccc',
};

const styleSelected: CSSProperties = {
  borderColor: '#ff0000',
  borderStyle: 'solid',
};

/**
 * Entrypoint to report editor
 *
 * See EditorProps for more information
 */
export default function Editor(props: EditorProps) {
  const [selected, setSelected] = useState<number[] | null>(null);
  const [sourceDataOverride, setSourceDataOverride] = useState<
    SourceData | undefined
  >(undefined);
  const dragObj = useRef<TDragObj | null>(null);
  const [dragHighlight, setDragHighlight] = useState<number[] | null>(null);
  const transforms = Array.isArray(props.transforms)
    ? props.transforms
    : defaultTransforms;
  const widgets = Array.isArray(props.widgets) ? props.widgets : defaultWidgets;

  let props2: GeneralProps;

  async function drop(
    e: React.DragEvent<HTMLElement>,
    dest: number[],
  ): Promise<void> {
    e.preventDefault();
    e.stopPropagation();
    setDragHighlight(null);

    // widget
    if (dragObj.current) {
      const copy = e.altKey || e.metaKey;
      // dragObj.current is empty when you drag-drop some other element like logo, menu ...
      const report2 = dropImpl(props.report, dragObj.current, dest, copy);
      if (report2) {
        props.setReport(report2);
        setSelected(null);
      }
      dragObj.current = null;
      return;
    }

    // file upload
    const files = extractFiles(e.dataTransfer);
    if (files.length > 0) {
      if (!props.api.filesUpload) {
        alert('File upload not supported');
        return;
      }
      const f = files[0];
      const dt: ApiUploadMetaData = {
        name: f.name,
        modifiedTime:
          new Date(f.lastModified).toISOString().substring(0, 19) + 'Z',
        mimeType: f.type,
      };
      try {
        await props.api.filesUpload(f, dt, () => {});
      } catch (e) {
        alert(`Error while uploading: ${String(e)}`);
      }
      const newItemProps: WidgetNewProps = { report: props.report };
      const img = (await ImageWidget.newItem(newItemProps)) as ImageData;
      img.url = `${apiPrefix}${f.name}`;
      const report2 = dropImpl(
        props.report,
        { type: 'widget', widget: img },
        dest,
        false,
      );
      if (report2) {
        props.setReport(report2);
        setSelected(null);
      }
      dragObj.current = null;
      return;
    }
  }

  function dragOver(e: React.DragEvent<HTMLDivElement>): void {
    // widget
    if (dragObj.current) {
      e.stopPropagation();
      e.preventDefault();
      if (dragObj.current.type === 'wid') {
        const copy = e.altKey || e.metaKey;
        e.dataTransfer.dropEffect = copy ? 'copy' : 'move';
      } else {
        e.dataTransfer.dropEffect = 'copy';
      }
      return;
    }

    // file upload
    if (e.dataTransfer.items.length > 0 || e.dataTransfer.files.length > 0) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      return;
    }
  }

  function dragLeave() {
    setDragHighlight(null);
  }

  function renderSpacer(parents: number[]): ReactNode {
    return (
      <div
        style={{
          ...styleSpacer,
          ...((dragHighlight &&
            idCmp(dragHighlight, parents) &&
            styleDragHighlight) ||
            {}),
        }}
        onDrop={e => drop(e, parents)}
        onDragOver={dragOver}
        onDragEnter={() => setDragHighlight(parents)}
        onDragLeave={dragLeave}
        data-testid={`spacer-${parents.join(',')}`}
      ></div>
    );
  }

  function renderWidget(child: WidgetItem, wid: number[]): ReactNode {
    const obj = getWidget(widgets, child.type);

    return (
      <div
        style={{
          ...styleWidgetBox,
          ...((selected && idCmp(selected, wid) && styleSelected) || {}),
        }}
        onClick={e => widgetMouseClick(e, wid)}
        draggable={typeof obj.canDrag === 'undefined' || obj.canDrag}
        onDragStart={e => dragWidgetStart(e, { type: 'wid', wid })}
        onDragEnd={e => dragWidgetEnd(e)}
        data-testid={`widget-${wid.join(',')}`}
      >
        <obj.Editor
          {...props2}
          item={child}
          setItem={(itm: WidgetItem) => {
            const r2 = updateItem(props2.report, wid, itm);
            return props2.setReport(r2);
          }}
          wid={wid}
        />
      </div>
    );
  }

  function renderWidgets(children: WidgetItem[], parents: number[]): ReactNode {
    return (
      <>
        {renderSpacer([...parents, 0])}
        {children.map((c, idx) => (
          <React.Fragment key={idx}>
            {renderWidget(c, [...parents, idx])}
            {renderSpacer([...parents, idx + 1])}
          </React.Fragment>
        ))}
      </>
    );
  }

  function dragWidgetStart(
    e: React.DragEvent<HTMLElement>,
    dragObj2: TDragObj,
  ): void {
    e.stopPropagation();
    dragObj.current = dragObj2;
  }

  function dragWidgetEnd(e: React.DragEvent<HTMLElement>): void {
    e.stopPropagation();
    dragObj.current = null;
  }

  function widgetMouseClick(
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    wid: number[],
  ) {
    e.preventDefault();
    e.stopPropagation();
    wid = [...wid];
    while (wid.length > 0) {
      const item = findInList(props.report, wid);
      const obj = getWidget(widgets, item.type);
      if (typeof obj.canSelect === 'undefined' || obj.canSelect) {
        setSelected(wid);
        break;
      }
      wid.splice(wid.length - 1, 1);
    }
  }

  props2 = {
    ...props,

    selected,
    setSelected,
    sourceDataOverride,
    setSourceDataOverride,

    renderWidget,
    renderWidgets,
    dragWidgetStart,
    dragWidgetEnd,
    drop,
    transforms,
    widgets,

    navbar: props.navbar || {},
  };

  return <Layout {...props2} dragOver={dragOver} />;
}

export function dropImpl(
  report: Report,
  current: TDragObj,
  dest: number[],
  copy: boolean,
): Report | null {
  if (dest.length === 0) {
    throw new Error('dest does not exist');
  }

  let toInsert: WidgetItem | WidgetItem[];
  let report2: Report = report;
  const type = current.type;
  switch (type) {
    case 'wid':
      {
        const dragObj3 = current.wid;
        if (copy) {
          toInsert = findInList(report2, dragObj3);
          toInsert = JSON.parse(JSON.stringify(toInsert));
        }
        // calc destination id
        else {
          // detect if dragging item to one of its childs
          let dest2;
          try {
            dest2 = updateDestAfterRemove(dest, dragObj3);
          } catch (e) {
            return null;
          }
          toInsert = findInList(report2, dragObj3);
          // remove from list
          report2 = removeFromList(report2, dragObj3);
          // update destination id
          dest = dest2;
        }
      }
      break;
    case 'widget':
      toInsert = current.widget;
      break;
    case 'widgets':
      toInsert = current.widgets;
      break;
    default:
      const exhaustiveCheck: never = type;
      throw new Error(`Unknown data type: ${exhaustiveCheck}`);
  }

  // insert
  if (!Array.isArray(toInsert)) {
    report2 = insertIntoList(report2, dest, toInsert);
  } else {
    for (const toInsert2 of toInsert) {
      report2 = insertIntoList(report2, dest, toInsert2);
      dest[dest.length - 1] += 1;
    }
  }

  return report2;
}
