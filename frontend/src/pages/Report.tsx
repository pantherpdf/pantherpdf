import React from 'react'
import App from '../Layout'
import { RouteComponentProps, Link } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { TReport, transformData } from 'reports-shared'
import type { ReportResponse, GenerateResponse } from '../../../backend/src/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint, faRedo, faSpinner, faUndo } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from '../context'
import { Editor } from 'reports-shared'
import getApi from '../api'


interface MenuProps extends RouteComponentProps<any> {
	loading: boolean,
	enableUndo: boolean,
	enableRedo: boolean,
	undo: () => Promise<void>,
	redo: () => Promise<void>,
	print: () => Promise<void>,
}

function Menu(props: MenuProps) {
	const app = useContext(AppContext)
	return <>
		<header className='border-bottom mb-3 fixed-top'>
			<div className='container'>
				<div className='d-flex py-2'>
					<ul className='nav flex-grow-1'>
						<li><Link to='/' className='nav-link px-3 link-secondary'>Kelgrand Reports</Link></li>
						<li><Link to='/reports' className='nav-link px-3 link-secondary'>Reports</Link></li>
					</ul>
					<div>
						<button type='button' className='btn btn-outline-secondary me-3' onClick={props.print}>
							<FontAwesomeIcon icon={faPrint} fixedWidth />
						</button>
						<div className="btn-group" role="group">
							<button type="button" className="btn btn-outline-secondary" onClick={props.undo} disabled={!props.enableUndo}>
								<FontAwesomeIcon icon={faUndo} fixedWidth />
							</button>
							<button type="button" className="btn btn-outline-secondary" onClick={props.redo} disabled={!props.enableRedo}>
								<FontAwesomeIcon icon={faRedo} fixedWidth />
							</button>
						</div>
						{props.loading && <FontAwesomeIcon icon={faSpinner} spin />}
					</div>
					<div className='flex-grow-1 d-flex justify-content-end'>
						<ul className='nav'>
							<li><button className='btn nav-link px-3 link-secondary' onClick={async () => { await app.logout(); props.history.push('/login')}}>Logout</button></li>
						</ul>
					</div>
				</div>
			</div>
		</header>
		<div style={{height:'60px'}} />
	</>
}



type ReportParams = { id: string }
interface ReportProps extends RouteComponentProps<ReportParams> {
}

export default function Report(props: ReportProps) {
	const [report, setReport] = useState<TReport | null>()
	const [loading, setLoading] = useState<boolean>(true)

	const [undoStack, setUndoStack] = useState<TReport[]>([])
	const [undoNext, setUndoNext] = useState<number>(0)

	const app = useContext(AppContext)
	const id = props.match.params.id


	async function changeData(cb: ()=>TReport): Promise<void> {
		setLoading(true)

		// save current state
		const oldUndoStack = undoStack
		const oldUndoNext = undoNext
		const oldVal = report

		// set new data locally
		const val = cb()
		setReport(val)
		
		// send to DB
		try {
			const r = await fetch(`/.netlify/functions/reportUpdate`, {method:'POST', headers: {Authorization: `Bearer sid:${app.sid}`, 'Content-Type':'application/json'}, body:JSON.stringify(val)})
			if (!r.ok) {
				const js = await r.json()
				const msg = (typeof js == 'object' && 'msg' in js && typeof js.msg == 'string') ? js.msg : 'unknown error'
				throw new Error(msg)
			}
		}
		catch(e) {
			setLoading(false)
			alert(e.message)
			setReport(oldVal)
			setUndoStack(oldUndoStack)
			setUndoNext(oldUndoNext)
			return
		}

		// ok
		setLoading(false)

		// update allReports
		app.reportsUpdate(val._id, val)
	}

	async function setReport2(val: TReport) {
		changeData(() => {
			const newUndoStack = [...undoStack]
			newUndoStack.splice(undoNext)
			newUndoStack.push(val)
			setUndoStack(newUndoStack)
			setUndoNext(undoNext+1)
			return val
		})
	}

	async function undo() {
		changeData(() => {
			const report = undoStack[undoNext-2]
			setUndoNext(undoNext-1)
			return report
		})
	}

	async function redo() {
		changeData(() => {
			const report = undoStack[undoNext]
			setUndoNext(undoNext+1)
			return report
		})
	}

	async function deleteReport() {
		// delete from db
		const r = await fetch(`/.netlify/functions/reportDelete?id=${id}`, {method:'POST', headers: {Authorization: `Bearer sid:${app.sid}`}})
		if (!r.ok) {
			const js = await r.json()
			const msg = (typeof js == 'object' && 'msg' in js && typeof js.msg == 'string') ? js.msg : 'unknown error'
			alert(msg)
			return Promise.reject()
		}
		
		// redirect
		app.reportsUpdate(id, null)
		props.history.replace('/reports')
	}

	async function print() {
		if (!report)
			return
		const w = window.open('', '_blank')
		if (!w)
			return
		const data = await transformData(getOriginalSourceData(), report)
		const r = await fetch(`/.netlify/functions/generate?id=${id}`, {method: 'POST', headers: {Authorization: `Bearer sid:${app.sid}`, 'Content-Type': 'application/json'}, body: JSON.stringify(data)})
		const js = await r.json() as GenerateResponse
		if (!r.ok || 'msg' in js) {
			w.close()
			const msg = 'msg' in js ? js.msg : 'unknown error'
			alert(msg)
			return
		}
		w.location.href = `${window.location.origin}/reportsPreview/${js.accessKey}`
	}


	// load report from db
	useEffect(() => {
		setReport(null)
		setLoading(true)
		setUndoStack([])
		setUndoNext(0);

		(async function() {
			const r = await fetch(`/.netlify/functions/report?id=${id}`, {headers: {Authorization: `Bearer sid:${app.sid}`}})
			const js = await r.json() as ReportResponse
			if (!r.ok || 'msg' in js) {
				const msg = 'msg' in js ? js.msg : 'unknown error'
				console.log(msg)
			}
			else {
				setReport(js.obj)
				setUndoStack([js.obj])
				setUndoNext(1)
			}
			setLoading(false)
		})()
	}, [id, app.sid])

	
	// is loading?
	if (!report && loading) {
		return <App {...props}><main className='container'>
			<div className='d-flex justify-content-center'>
				<FontAwesomeIcon icon={faSpinner} spin={true} style={{margin:'50px auto', fontSize:'2rem'}} /> 
			</div>
		</main></App>
	}

	// error - not found
	if (!report) {
		return <App {...props}><main className='container'><h1>Error. Report not found</h1></main></App>
	}

	function getOriginalSourceData() {
		// todo temp function
		return { arr: [1,2,3,4,5,6,7,8,9] }
	}

	const api = getApi(app)

	// show editor
	return <>
		<Menu
			{...props}
			loading={loading}
			enableUndo={undoNext > 1}
			enableRedo={undoNext < undoStack.length}
			undo={undo}
			redo={redo}
			print={print}
		/>
		<Editor
			report={report}
			setReport={setReport2}
			deleteReport={deleteReport}
			allReports={app.reports}
			getOriginalSourceData={getOriginalSourceData}
			api={api}
		/>
	</>
}
