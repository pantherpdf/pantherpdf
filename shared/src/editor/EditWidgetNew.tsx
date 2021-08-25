/**
 * EditWidgetNew.tsx
 * List of available widgets to build a report. 
 */


import React, { useEffect, useRef, useState } from 'react'
import Trans, { TransName } from '../translation'
import style from './EditWidgets.module.css'
import { saveAs } from 'file-saver'
import { ReportResponseBase } from '../types'
import { Widget, GeneralProps, NewItemProps } from './types'
import { allWidgets } from '../widgets/allWidgets'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faMinus, faPlus, faUpload } from '@fortawesome/free-solid-svg-icons'
import { Overlay, Tooltip } from 'react-bootstrap'

interface ExpandableProps {
	name: string,
	defaultExpanded?: boolean,
	children: React.ReactNode,
}

function Expandable(props: ExpandableProps) {
	const [expanded, setExpanded] = useState(props.defaultExpanded || false);
	return <div>
		<div className={'d-flex '+style.header} onClick={() => setExpanded(!expanded)}>
			<span className='mr-3' style={{fontSize:'110%'}}>
				<small className='me-2'>
					<FontAwesomeIcon icon={expanded ? faMinus : faPlus} fixedWidth />
				</small>
			</span>
			<strong>{props.name}</strong>
		</div>
		{expanded && <div className='pl-2'>{props.children}</div>}
	</div>
}



function ShowReports(props: GeneralProps) {

	async function dragStartReport(e: React.DragEvent<HTMLDivElement>, id: string) {
		let js: ReportResponseBase
		try {
			js = await props.api.reportGet(id)
		}
		catch(e) {
			alert(String(e))
			return
		}
		return props.dragWidgetStart(e, {type:'widgets', widgets:js.obj.children})
	}

	
	if(props.allReports.length === 0) {
		return <>
			<span className='text-muted'>
				{Trans('empty')}
			</span>
		</>
	}
	return <>{props.allReports.map((r,idx) => <React.Fragment key={idx}>
			<div
				key={idx}
				draggable={true}
				onDragStart={(e) => dragStartReport(e, r._id)}
				onDragEnd={props.dragWidgetEnd}
				className={style.widget}
			>
				{TransName(r.name)}
			</div>
		</React.Fragment>
	)}</>
}





function ShowWidgets(props: GeneralProps) {
	const target = useRef<HTMLDivElement | null>(null)
	const tooltipTimer = useRef<number>(0)
	const [showTooltipIdx, setShowTooltipIdx] = useState<number>(-1)

	function showTooltip(idx: number, el: HTMLDivElement) {
		hideTooltip()
		tooltipTimer.current = window.setTimeout(hideTooltip, 2500)
		target.current = el
		setShowTooltipIdx(idx)
	}

	function hideTooltip() {
		if (tooltipTimer.current === 0) {
			return
		}
		clearTimeout(tooltipTimer.current)
		tooltipTimer.current = 0
		target.current = null
		setShowTooltipIdx(-1)
	}

	useEffect(() => {
		return () => {
			hideTooltip()
		}
	}, [])

	async function dragStartWidget(e: React.DragEvent<HTMLDivElement>, w: Widget) {
		const propsNewItem: NewItemProps = {
			report: props.report,
		}
		const obj = await w.newItem(propsNewItem)
		return props.dragWidgetStart(e, {type:'widget', widget:obj})
	}
	
	return <>
		{Object.values(allWidgets).map((w,idx) => {
			if (typeof w.canAdd !== 'undefined' && !w.canAdd) {
				return null
			}
			return <div
				key={idx}
				draggable={true}
				onDragStart={e => dragStartWidget(e, w)}
				onDragEnd={e => props.dragWidgetEnd(e)}
				className={style.widget}
				onClick={e => showTooltip(idx, e.currentTarget)}
			>
				<FontAwesomeIcon icon={w.icon.fontawesome} fixedWidth className='me-2' />
				{TransName(w.name)}
			</div>
		})}
		<Overlay target={target.current} show={showTooltipIdx!==-1} placement='right'>
			{(props) => <Tooltip id='editWidgetNewWidgetTooltip' {...props}>
				{Trans('drag drop widgets')}
			</Tooltip>}
		</Overlay>
	</>
}


/*
function ShowPredefined(props: GeneralProps) {
	const predefined: {name: string, data: TData}[] = []
	return <>{predefined.map((w,idx) => {
		return <div
			key={idx}
			draggable={true}
			onDragStart={e => props.dragWidgetStart(e, {type:'widget', widget:w.data})}
			onDragEnd={e => props.dragWidgetEnd(e)}
			className={style.widget}
		>
			{TransName(w.name)}
		</div>
	})}</>
}
*/


function fileUpload(arr: any[], setArr: React.Dispatch<React.SetStateAction<any[]>>,) {
	const el = document.createElement('input')
	el.type = 'file'
	el.accept = 'application/json'
	el.addEventListener('change', () => {
		if (!el.files)
			return
		const fl = el.files[0]
		const fr = new FileReader()
		fr.addEventListener('load', e3 => {
			if (!e3.target || typeof e3.target.result !== 'string') {
				throw new Error('Bad value')
			}
			let dt
			try {
				dt = JSON.parse(e3.target.result)
			}
			catch(e) {
				alert(Trans('upload bad file')+' '+(String(e)))
				return
			}
			let n = arr.length
			setArr([...arr, dt])
			alert(Trans('upload finished', [(n+1).toString()]))
		});
		fr.readAsText(fl);
	})
	el.click()
}


function ShowUpload(props: GeneralProps) {
	const [arr, setArr] = useState<any[]>([]);

	function fileDownload() {
		let blob = new Blob([JSON.stringify(props.report,null,4)], {type: 'application/json'});
		saveAs(blob, props.report._id+'.json');
	}

	function dragStartFile(e: React.DragEvent<HTMLDivElement>, dt: any) {
		if(dt && !Array.isArray(dt) && dt._id && dt.children && Array.isArray(dt.children)) {
			return props.dragWidgetStart(e, {type:'widgets', widgets:dt.children})
		}
		else if(Array.isArray(dt)) {
			return props.dragWidgetStart(e, {type:'widgets', widgets:dt})
		}
		else {
			return props.dragWidgetStart(e, {type:'widget', widget:dt})
		}
	}

	return <>
		<div className="btn-group" role="group">
			<button className='btn btn-primary' onClick={fileDownload}>
				<FontAwesomeIcon icon={faDownload} fixedWidth className='me-2' />
				{Trans('download')}
			</button>
			<button className='btn btn-outline-primary' onClick={() => fileUpload(arr, setArr)}>
				<FontAwesomeIcon icon={faUpload} fixedWidth className='me-2' />
				{Trans('upload')}
			</button>
		</div>
		<hr />
		{arr.map((r,idx) => <div
			key={idx}
			draggable={true}
			onDragStart={(e) => dragStartFile(e, r)}
			onDragEnd={props.dragWidgetEnd}
			className={style.widget}
		>
			{(idx+1).toString()}
		</div>)}
	</>
}


export default function EditWidgetNew(props: GeneralProps) {
	if (props.report.target !== 'pdf') {
		return <div className='text-muted'><small>{Trans('no widgets available for target -name-', [props.report.target])}</small></div>
	}
	return <>
		<Expandable name={Trans('widgets')} defaultExpanded={true}>
			<ShowWidgets {...props} />
		</Expandable>
		{/*
		<Expandable name={Trans('predefined')}>
			<ShowPredefined {...props} />
		</Expandable>
		*/}
		<Expandable name={Trans('reports')}>
			<ShowReports {...props} />
		</Expandable>
		<Expandable name={Trans('file')}>
			<ShowUpload {...props} />
		</Expandable>
	</>
}
