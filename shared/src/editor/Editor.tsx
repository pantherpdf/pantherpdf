/**
 * Editor.tsx
 * Managing global state, prepare GeneralProps, drag-drop functions
 */


import React, { ReactNode, useEffect, useRef } from 'react'
import { useState } from 'react'
import getWidget from '../widgets/allWidgets'
import { TReport, TData, ApiEndpoints } from '../types'
import { GeneralProps, TDragObj } from './types'
import style from './Editor.module.css'
import Layout from './EditorLayout'
import { findInList, removeFromList, insertIntoList, updateDestAfterRemove, idCmp, updateItem } from './childrenMgmt'
import { transformData } from './DataTransform'


interface EditorProps {
	report: TReport,
	setReport: (val: TReport) => Promise<void>,
	deleteReport: () => void,
	api: ApiEndpoints,
}


interface SourceData {
	data: any,
	msg: string | undefined,
}


export function dropImpl(report: TReport, current: TDragObj, dest: number[], copy: boolean): TReport | null {
	//console.log('dest',dest)
	//console.log('source',JSON.stringify(current))
	if (dest.length === 0) {
		throw new Error('dest does not exist')
	}

	let toInsert: TData | TData[]
	let report2: TReport = report
	if (current.type === 'wid') {
		const dragObj3 = current.wid
		if (copy) {
			toInsert = findInList(report2, dragObj3)
			toInsert = JSON.parse(JSON.stringify(toInsert))
		}
		else {
			// calc destination id
			// detect if dragging item to one of its childs
			let dest2
			try {
				dest2 = updateDestAfterRemove(dest, dragObj3)
			}
			catch(e) {
				return null
			}
			toInsert = findInList(report2, dragObj3)
			// remove from list
			report2 = removeFromList(report2, dragObj3)
			// update destination id
			dest = dest2
		}
	}
	else if (current.type === 'widget') {
		toInsert = current.widget
	}
	else if (current.type === 'widgets') {
		toInsert = current.widgets
	}
	else {
		throw new Error('unknown dragObj2 type')
	}

	// insert
	if (!Array.isArray(toInsert)) {
		report2 = insertIntoList(report2, dest, toInsert)
	}
	else {
		for (const toInsert2 of toInsert) {
			report2 = insertIntoList(report2, dest, toInsert2)
			dest[dest.length-1] += 1
		}
	}

	return report2
}


export default function Editor(props: EditorProps) {
	const [selected, setSelected] = useState<number[]|null>(null)
	const [source, setSource] = useState<SourceData>({data: null, msg: 'loading ...'})
	const dragObj = useRef<TDragObj|null>(null)
	const [overrideSourceData, setOverrideSourceData] = useState<string | null>(null)

	useEffect(() => {
		refreshSourceData(props.report)
		// eslint-disable-next-line
	}, [overrideSourceData, props.report.dataUrl, props.report.transforms])

	async function getOriginalSourceData(report: TReport): Promise<any> {
		if (overrideSourceData) {
			return JSON.parse(overrideSourceData)
		}
		if (report.dataUrl.length > 0) {
			let url = report.dataUrl
			if (url.startsWith('local/')) {
				url = props.api.filesDownloadUrl(url.substring(6))
			}
			const r = await fetch(url, {
				headers: {
					Accept: 'text/javascript, application/json'
				},
			})
			if (r.status !== 200) {
				throw new Error(`Bad response status: ${r.status}`)
			}
			const ct = (r.headers.get('Content-Type') || '').split(';')[0].trim()
			if (ct === 'text/javascript' || ct === 'application/javascript') {
				// cannot import module because import() gets transformed into something else
				//const module = await import(url)
				
				// cannot eval and import because nodejs doesnt support importing from http://
				//const enc = encodeURIComponent(url)
				//const prms = eval(`import("${decodeURIComponent(enc)}")`)
				//const module = await prms
				//const getData = module.default
				//return getData()

				//
				const code = await r.text()
				const a = eval(code+';;;;{getData();}')
				const data = await a
				return data
			}
			if (ct === 'application/json') {
				return r.json()
			}
			throw new Error(`Invalid response. Content-Type: ${ct}`)
		}
	}

	async function setOverrideSourceData2(data: any) {
		setOverrideSourceData(JSON.stringify(data))
	}

	async function refreshSourceData(report: TReport) {
		// get current report data because props.report may not update yet
		let data
		try {
			data = await getOriginalSourceData(report);
			data = await transformData(data, report)
		}
		catch(e) {
			const msg = e instanceof Error ? e.message : 'Unknown error'
			setSource({data: null, msg})
			return
		}
		setSource({data: data, msg: undefined})
	}

	let props2: GeneralProps

	function drop(e: React.DragEvent<HTMLDivElement>, dest: number[]): void {
		e.preventDefault()
		e.stopPropagation()
		e.currentTarget.classList.remove(style.dragging)
		const copy = e.altKey || e.metaKey

		if (dragObj.current) {
			// dragObj.current is empty when you drag-drop some other element like logo, menu ...
			const report2 = dropImpl(props.report, dragObj.current, dest, copy)
			if (report2) {
				props.setReport(report2)
				setSelected(null)
			}
		}

		dragObj.current = null
	}

	function dragOver(e: React.DragEvent<HTMLDivElement>): void {
		if (!dragObj.current) {
			return
		}
		e.stopPropagation()
		e.preventDefault()
		if (dragObj.current.type === 'wid') {
			const copy = e.altKey || e.metaKey
			e.dataTransfer.dropEffect = copy ? 'copy' : 'move'
		}
		else {
			e.dataTransfer.dropEffect = 'copy'
		}
	}

	function dragEnter(e: React.DragEvent<HTMLDivElement>): void {
		if (dragObj.current) {
			e.currentTarget.classList.add(style.dragging)
		}
	}

	function dragLeave(e: React.DragEvent<HTMLDivElement>): void {
		e.currentTarget.classList.remove(style.dragging)
	}

	function renderSpacer(parents: number[]): ReactNode {
		return <div
			className={style.spacer}
			onDrop={e=>drop(e, parents)}
			onDragOver={dragOver}
			onDragEnter={dragEnter}
			onDragLeave={dragLeave}
		>
		</div>
	}

	function renderWidget(child: TData, wid: number[]): ReactNode {
		const obj = getWidget(child.type)
		
		return <div
			className={`${style.widgetBox} ${(selected && idCmp(selected,wid) && style.selected) || ''}`}
			onClick={e=>widgetMouseClick(e, wid)}
			draggable={typeof obj.canDrag === 'undefined' || obj.canDrag}
			onDragStart={e=>dragWidgetStart(e, {type:'wid',wid})}
			onDragEnd={e=>dragWidgetEnd(e)}
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
	}

	function renderWidgets(children: TData[], parents: number[]): ReactNode {
		return <>
			{renderSpacer([...parents, 0])}
			{children.map((c,idx) => <React.Fragment key={idx}>
				{renderWidget(c, [...parents, idx])}
				{renderSpacer([...parents, (idx+1)])}
			</React.Fragment>)}
		</>
	}

	function dragWidgetStart(e: React.DragEvent<HTMLDivElement>, dragObj2: TDragObj): void {
		e.stopPropagation()
		dragObj.current = dragObj2
	}

	function dragWidgetEnd(e: React.DragEvent<HTMLDivElement>): void {
		e.stopPropagation()
		dragObj.current = null
	}

	function widgetMouseClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>, wid: number[]) {
		e.preventDefault()
		e.stopPropagation()
		wid = [...wid]
		while (wid.length > 0) {
			const item = findInList(props.report, wid)
			const obj = getWidget(item.type)
			if (typeof obj.canSelect === 'undefined' || obj.canSelect) {
				setSelected(wid)
				break
			}
			wid.splice(wid.length-1, 1)
		}
	}
	
	props2 = {
		getOriginalSourceData: getOriginalSourceData,
		overrideSourceData: setOverrideSourceData2,
		isOverridenSourceData: !!overrideSourceData,
		refreshSourceData: refreshSourceData,
		sourceData: source.data,
		sourceErrorMsg: source.msg,
		api: props.api,

		report: props.report,
		setReport: props.setReport,
		deleteReport: props.deleteReport,
		
		selected,
		setSelected,

		renderWidget,
		renderWidgets,
		dragWidgetStart,
		dragWidgetEnd,
		drop,
	}

	return <Layout {...props2} dragOver={dragOver} />
}
