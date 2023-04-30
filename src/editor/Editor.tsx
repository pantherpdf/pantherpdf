/**
 * Editor.tsx
 * Managing global state, prepare GeneralProps, drag-drop functions
 */

import React, { ReactNode, useEffect, useRef } from 'react';
import { useState } from 'react';
import getWidget from '../widgets/allWidgets';
import { TReport, TData, FileUploadData } from '../types';
import {
  EditorProps,
  GeneralProps,
  NewItemProps,
  TDragObj,
  TSourceData,
} from './types';
import style from './Editor.module.css';
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
import { Image as ImageWidget, ImageData } from '../widgets/Image';
import { transformData } from './DataTransform';
import retrieveOriginalSourceData from './retrieveOriginalSourceData';

export function dropImpl(
  report: TReport,
  current: TDragObj,
  dest: number[],
  copy: boolean,
): TReport | null {
  if (dest.length === 0) {
    throw new Error('dest does not exist');
  }

  let toInsert: TData | TData[];
  let report2: TReport = report;
  if (current.type === 'wid') {
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
  //
  else if (current.type === 'widget') {
    toInsert = current.widget;
  }
  //
  else if (current.type === 'widgets') {
    toInsert = current.widgets;
  }
  //
  else {
    throw new Error('unknown dragObj2 type');
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

export default function Editor(props: EditorProps) {
  const [selected, setSelected] = useState<number[] | null>(null);
  const [data, setData] = useState<TSourceData>({ data: undefined });
  const [overrideSourceData, setSourceDataOverride] = useState<
    string | undefined
  >(undefined);
  const dragObj = useRef<TDragObj | null>(null);

  // refresh data
  useEffect(() => {
    (async function () {
      try {
        const dt1 = await getOrigSourceInternal();
        const dt2 = await transformData(dt1, props.report.transforms, true);
        setData({ data: dt2 });
      } catch (e) {
        setData({ data: undefined, errorMsg: String(e) });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideSourceData, props.report.dataUrl, props.report.transforms]);

  async function getOrigSourceInternal(): Promise<unknown> {
    if (typeof props.sourceData !== 'undefined') {
      return props.sourceData;
    }
    if (overrideSourceData !== undefined) {
      return JSON.parse(overrideSourceData);
    }
    return retrieveOriginalSourceData({
      reportDataUrl: props.report.dataUrl,
      api: props.api,
      allowUnsafeJsEval: true,
    });
  }

  let props2: GeneralProps;

  async function drop(
    e: React.DragEvent<HTMLDivElement>,
    dest: number[],
  ): Promise<void> {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove(style.dragging);

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
      const dt: FileUploadData = {
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
      const newItemProps: NewItemProps = { report: props.report };
      const img = (await ImageWidget.newItem(newItemProps)) as ImageData;
      img.url = `local/${f.name}`;
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

  function dragEnter(e: React.DragEvent<HTMLDivElement>): void {
    if (dragObj.current) {
      e.currentTarget.classList.add(style.dragging);
    }
  }

  function dragLeave(e: React.DragEvent<HTMLDivElement>): void {
    e.currentTarget.classList.remove(style.dragging);
  }

  function renderSpacer(parents: number[]): ReactNode {
    return (
      <div
        className={style.spacer}
        onDrop={e => drop(e, parents)}
        onDragOver={dragOver}
        onDragEnter={dragEnter}
        onDragLeave={dragLeave}
      ></div>
    );
  }

  function renderWidget(child: TData, wid: number[]): ReactNode {
    const obj = getWidget(child.type);

    return (
      <div
        className={`${style.widgetBox} ${
          (selected && idCmp(selected, wid) && style.selected) || ''
        }`}
        onClick={e => widgetMouseClick(e, wid)}
        draggable={typeof obj.canDrag === 'undefined' || obj.canDrag}
        onDragStart={e => dragWidgetStart(e, { type: 'wid', wid })}
        onDragEnd={e => dragWidgetEnd(e)}
      >
        <obj.Render
          {...props2}
          item={child}
          setItem={(itm: TData) => {
            const r2 = updateItem(props2.report, wid, itm);
            return props2.setReport(r2);
          }}
          wid={wid}
        />
      </div>
    );
  }

  function renderWidgets(children: TData[], parents: number[]): ReactNode {
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
    e: React.DragEvent<HTMLDivElement>,
    dragObj2: TDragObj,
  ): void {
    e.stopPropagation();
    dragObj.current = dragObj2;
  }

  function dragWidgetEnd(e: React.DragEvent<HTMLDivElement>): void {
    e.stopPropagation();
    dragObj.current = null;
  }

  function widgetMouseClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    wid: number[],
  ) {
    e.preventDefault();
    e.stopPropagation();
    wid = [...wid];
    while (wid.length > 0) {
      const item = findInList(props.report, wid);
      const obj = getWidget(item.type);
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
    ...(typeof props.sourceData === 'undefined'
      ? {
          setSourceDataOverride: (data: unknown) => {
            const dt =
              typeof data !== 'undefined' ? JSON.stringify(data) : undefined;
            setSourceDataOverride(dt);
          },
        }
      : {}),
    getSourceData: getOrigSourceInternal,
    isSourceDataOverriden: !!overrideSourceData,
    data,

    renderWidget,
    renderWidgets,
    dragWidgetStart,
    dragWidgetEnd,
    drop,
  };

  return <Layout {...props2} dragOver={dragOver} />;
}
