/**
 * Editor.tsx
 * Managing global state, prepare GeneralProps, drag-drop functions
 */


import React, { ReactNode, useRef } from 'react'
import { useState } from 'react'
import getWidget from '../widgets/allWidgets'
import { TData, GeneralProps, TReport, TReportShort, TDragObj } from './types'
import style from './Editor.module.css'
import Layout from './EditorLayout'
import { findInList, removeFromList, insertIntoList, updateDestAfterRemove, idCmp, updateItem } from './childrenMgmt'


interface Props {
	report: TReport,
	setReport: (val: TReport) => Promise<void>,
	deleteReport: () => void,
	allReports: TReportShort[],
}


export default function Editor(props: Props) {
	const [selected, setSelected] = useState<number[]|null>(null)
	const [source, setSource] = useState<any>({})
	const dragObj = useRef<TDragObj|null>(null)

	let props2: GeneralProps

	function drop(e: React.DragEvent<HTMLDivElement>, dest: number[]): void {
		e.preventDefault()
		e.stopPropagation()
		e.currentTarget.classList.remove(style.dragging)

		if (!dragObj.current) {
			// happens when you drag-drop some other element like logo, menu ...
			return
		}

		let toInsert: TData | TData[]
		let report2: TReport = props.report
		if (dragObj.current.type === 'wid') {
			const dragObj2 = dragObj.current.wid
			const copy = e.altKey || e.metaKey
			if (copy) {
				toInsert = findInList(report2, dragObj2)
				toInsert = JSON.parse(JSON.stringify(dragObj2))
			}
			else {
				toInsert = findInList(report2, dragObj2)
				// remove from list
				report2 = removeFromList(report2, dragObj2)
				// update destination id
				dest = updateDestAfterRemove(dest, dragObj2)
			}
		}
		else if (dragObj.current.type === 'widget') {
			toInsert = dragObj.current.widget
		}
		else if (dragObj.current.type === 'widgets') {
			toInsert = dragObj.current.widgets
		}
		else {
			throw new Error('unknown dragObj type')
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

		props.setReport(report2)
		setSelected(null)
		dragObj.current = null
	}

	function dragOver(e: React.DragEvent<HTMLDivElement>): void {
		if (!dragObj.current) {
			return
		}
		e.stopPropagation()
		e.preventDefault()
		if (dragObj.current.type === 'wid') {
			e.dataTransfer.dropEffect = 'copy'
		}
		else {
			const copy = e.altKey || e.metaKey
			e.dataTransfer.dropEffect = copy ? 'copy' : 'move'
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
			draggable={true}
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
		return <div>
			{renderSpacer([...parents, 0])}
			{children.map((c,idx) => <React.Fragment key={idx}>
				{renderWidget(c, [...parents, idx])}
				{renderSpacer([...parents, (idx+1)])}
			</React.Fragment>)}
		</div>
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
		setSelected(wid)
	}
	
	props2 = {
		allReports: props.allReports,
		sourceData: source,

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
