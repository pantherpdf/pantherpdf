/**
 * EditorLayout.tsx
 */


import React from 'react'
import { defaultReportCss, TData } from '../types'
import { GeneralProps } from './types'
import Trans, { TransName } from '../translation'
import { PropertyFontGenCss } from '../widgets/PropertyFont'
import ObjectExplorer from './ObjectExplorer'
import DataTransform from './DataTransform'
import EditWidgetNew from './EditWidgetNew'
import style from './Editor.module.css'
import getWidget from '../widgets/allWidgets'
import { findInList, removeFromList, updateItem } from './childrenMgmt'
import ReportSettings from './ReportSettings'
import { extractFiles } from '../FileSelect'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { LoadGoogleFontCss } from '../widgets/GoogleFonts'


interface PropertiesHeaderProps extends GeneralProps {
	name: string | { [key: string]: string },
	onDelete?: () => void,
}
function PropertiesHeader(props: PropertiesHeaderProps) {
	return <div className='d-flex section-name'>
		<div className='flex-fill'>
			{TransName(props.name)}
		</div>
		{!!props.onDelete && <button
			className='btn btn-sm btn-outline-danger'
			onClick={props.onDelete}
		>
			<FontAwesomeIcon icon={faTrash} />
		</button>}
	</div>
}


function Properties(props: GeneralProps) {
	if (!props.selected) {
		function deleteReport() {
			if (!props.deleteReport) {
				return
			}
			if (!window.confirm(Trans('delete report question'))) {
				return
			}
			return props.deleteReport()
		}
		return <>
			<PropertiesHeader
				{...props}
				name={Trans('report')}
				onDelete={props.deleteReport ? deleteReport : undefined}
			/>
			<ReportSettings {...props} />
		</>
	}

	function remove() {
		if (!props.selected) {
			return
		}
		const report = removeFromList(props.report, props.selected)
		props.setReport(report)
		props.setSelected(null)
	}

	const wid = props.selected
	const selected = findInList(props.report, wid)
	const comp = getWidget(selected.type)
	if (!comp.RenderProperties) {
		return <PropertiesHeader
			{...props}
			name={comp.name}
			onDelete={remove}
		/>
	}
	return <>
		<PropertiesHeader
			{...props}
			name={comp.name}
			onDelete={remove}
		/>
		<comp.RenderProperties
			{...props}
			item={selected}
			setItem={(itm: TData) => {
				const r2 = updateItem(props.report, wid, itm);
				return props.setReport(r2);
			}}
			wid={props.selected}
		/>
	</>
}


function RenderContent(props: GeneralProps) {
	const t = props.report.target
	if (t === 'pdf') {
		const style = {...defaultReportCss, ...PropertyFontGenCss(props.report.properties.font || {})}
		if (props.report.properties.font?.family) {
			LoadGoogleFontCss(props.report.properties.font.family)
		}
		return <div style={style}>
			{props.renderWidgets(props.report.children, [])}
			{props.report.children.length === 0 && <div className='text-muted text-center'>
				{Trans('drag drop widgets here')}
			</div>}
		</div>
	}
	
	if (t === 'json') {
		try {
			const content = JSON.stringify(props.data.data)
			return <pre>{content}</pre>
		}
		catch(e) {
			return <div className="alert alert-danger">
				{String(e)}
			</div>
		}
	}

	if (t === 'csv-excel-utf-8' || t === 'csv-windows-1250') {
		const dt = props.data.data
		if( !Array.isArray(dt) ) {
			return <div className="alert alert-danger">
				{Trans('data must be 2D array')}
			</div>
		}
		return <table className='table'>
			<tbody>
				{dt.map((row,idx) => <tr key={idx}>
					{Array.isArray(row) && row.map((cell,idx2) => <td key={idx2}>
						{String(cell)}
					</td>)}
				</tr>)}
			</tbody>
		</table>
	}

	throw new Error('unknown target')
}


export default function Layout(props: GeneralProps&{dragOver: (e: React.DragEvent<HTMLDivElement>)=>void}) {
	function resetSelection(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		e.preventDefault()
		e.stopPropagation()
		props.setSelected(null)
	}

	function keyDownHandler(e: React.KeyboardEvent<HTMLDivElement>) {
		if ((e.key === 'Backspace' || e.key === 'Delete') && props.selected) {
			// delete selected
			e.preventDefault()
			e.stopPropagation()
			const r = removeFromList(props.report, props.selected)
			props.setSelected(null)
			props.setReport(r)
		}
	}

	// drag-drop source data
	function onDragOver(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault()
		e.stopPropagation()
	}
	function onDrop(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault()
		e.stopPropagation()
		if (!props.overrideSourceData) {
			return
		}
		const arr = extractFiles(e.dataTransfer)
		if (arr.length === 0) {
			return
		}
		const f = arr[0]
		try {
			const reader = new FileReader()
			reader.onload = (e2) => {
				if (!e2.target || typeof e2.target.result !== 'string') {
					return
				}
				const dt = JSON.parse(e2.target.result)
				if (props.overrideSourceData) {
					props.overrideSourceData(dt)
				}
			}
			reader.readAsText(f)
		}
		catch(e) {
			alert(`Error: ${String(e)}`)
			return
		}
	}
	
	return <>
		<div className={style.box1}>
			<EditWidgetNew {...props} />
		</div>
		<div
			className={style.box2}
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			<DataTransform {...props} />
			<hr/>
			{props.data.errorMsg ? <div>{props.data.errorMsg}</div> : <ObjectExplorer data={props.data.data} />}
		</div>
		<div className={style.box3}>
			<Properties {...props} />
		</div>
		<div
			className={style.boxMain}
			onClick={resetSelection}
			onDragOver={props.dragOver}
			onDrop={e => props.drop(e, [props.report.children.length])}
			tabIndex={0}
			onKeyDown={keyDownHandler}
		>
			<div>
				<RenderContent {...props} />
			</div>
		</div>

	</>
}
