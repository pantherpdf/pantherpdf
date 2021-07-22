/**
 * EditWidgetNew.tsx
 * List of available widgets to build a report. 
 */


import React, { useState, useContext } from 'react'
import Trans, { TransName } from '../translation'
import style from './EditWidgets.module.css'
import { saveAs } from 'file-saver'
import { ReportResponse, TReportShort } from '../../../backend/shared/types'
import { Widget, GeneralProps } from './types'
import { allWidgets } from '../widgets/allWidgets'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from '../context'

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
				{/*expanded ? <i className='fas fa-minus fa-fw'/> : <i className='fas fa-plus fa-fw'/>*/}
				<small className='me-2'><FontAwesomeIcon icon={expanded ? faMinus : faPlus} fixedWidth /></small>
			</span>
			<strong>{props.name}</strong>
		</div>
		{expanded && <div className='pl-2'>{props.children}</div>}
	</div>
}



function ShowReports(props: GeneralProps) {
	const app = useContext(AppContext)

	async function dragStartReport(e: React.DragEvent<HTMLDivElement>, id: string) {
		const r = await fetch(`/.netlify/functions/report?id=${id}`, {headers: {Authorization: `Bearer sid:${app.sid}`}})
		const js = await r.json() as ReportResponse
		if (!r.ok || 'msg' in js) {
			const msg = 'msg' in js ? js.msg : 'unknown error'
			alert(msg)
			return
		}
		return props.dragWidgetStart(e, {type:'widgets', widgets:js.obj.children})
	}

	
	if(props.allReports.length === 0) {
		return <>{Trans('empty')}</>
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
	async function dragStartWidget(e: React.DragEvent<HTMLDivElement>, w: Widget) {
		const obj = await w.newItem()
		return props.dragWidgetStart(e, {type:'widget', widget:obj})
	}
	
	return <>{Object.values(allWidgets).map((w,idx) => {
		return <div
			key={idx}
			draggable={true}
			onDragStart={e => dragStartWidget(e, w)}
			onDragEnd={e => props.dragWidgetEnd(e)}
			className={style.widget}
		>
			<FontAwesomeIcon icon={w.icon.fontawesome} fixedWidth />
			{TransName(w.name)}
		</div>
	})}</>
}



function ShowPredefined(props: GeneralProps) {
	/*
	async function dragStartPredefined(props, idx) {
		const cmp = props.settings.predefined[idx]
		await window.kelgrand.web.loadWidget(cmp)
		const cmp2 = window.kelgrand.web.getWidget(cmp)
		const obj = cmp2()
		return props.dragStart(obj)
	}
	onDragStart={() => dragStartPredefined(props, idx)}
	onDragEnd={props.dragEnd}
	*/

	const predefined: TReportShort[] = []

	return <>{predefined.map((w,idx) => {
		return <div
			key={idx}
			draggable={true}
			className={style.widget}
		>
			{TransName(w.name)}
		</div>
	})}</>
}


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
		<div><button className='btn btn-primary m-1' onClick={fileDownload}>
			<i className='fas fa-download fa-fw mr-2'/>
			{Trans('download')}
		</button></div>
		<div><button className='btn btn-secondary m-1' onClick={() => fileUpload(arr, setArr)}>
			<i className='fas fa-upload fa-fw mr-2'/>
			{Trans('upload')}
		</button></div>
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
		return <div className='text-muted'><small>{Trans('no widgets available for target', [props.report.target])}</small></div>
	}
	return <>
		<Expandable name={Trans('widgets')} defaultExpanded={true}>
			<ShowWidgets {...props} />
		</Expandable>
		<Expandable name={Trans('predefined')}>
			<ShowPredefined {...props} />
		</Expandable>
		<Expandable name={Trans('reports')}>
			<ShowReports {...props} />
		</Expandable>
		<Expandable name={Trans('file')}>
			<ShowUpload {...props} />
		</Expandable>
	</>
}
