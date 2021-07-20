/**
 * EditorLayout.tsx
 */


import React from 'react'
import { TData, GeneralProps } from './types'
import Trans, { TransName } from '../translation'
import { PropertyFontGenCss } from '../widgets/PropertyFont'
import ObjectExplorer from './ObjectExplorer'
import DataTransform from './DataTransform'
import EditWidgetNew from './EditWidgetNew'
import style from './Editor.module.css'
import getWidget from '../widgets/allWidgets'
import { findInList, removeFromList, updateItem } from './childrenMgmt'


function ReportSettings(props: GeneralProps) {
	return <div>
		TODO
	</div>
}


function Properties(props: GeneralProps) {
	if (!props.selected) {
		return <>
			<div className='h3 border-bottom'>{Trans('report')}</div>
			<ReportSettings {...props} />
		</>
	}

	const wid = props.selected
	const selected = findInList(props.report, wid)
	const comp = getWidget(selected.type)
	if (!comp.RenderProperties)
		return <><div className='h3 border-bottom'>{TransName(comp.name)}</div></>
	return <>
		<div className='h3 border-bottom'>{TransName(comp.name)}</div>
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
		const style = props.report.properties.font ? PropertyFontGenCss(props.report.properties.font) : undefined
		return <div style={style}>
			{props.renderWidgets(props.report.children, [])}
		</div>
	}
	
	if (t === 'json') {
		try {
			const content = JSON.stringify(props.sourceData)
			return <pre>{content}</pre>
		}
		catch(e) {
			return <div className="alert alert-danger">{String(e)}</div>
		}
	}

	if (t === 'csv-excel-utf-8' || t === 'csv-windows-1250') {
		const dt = props.sourceData
		if( !Array.isArray(dt) ) {
			return <div className="alert alert-danger">Data must be 2D array</div>
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
	
	return <>
		<div className={style.box1}>
			<EditWidgetNew {...props} />
		</div>
		<div className={style.box2}>
			<div style={{paddingLeft:'1rem'}}>
				<DataTransform {...props} />
				<hr/>
			</div>
			<ObjectExplorer {...props} />
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
