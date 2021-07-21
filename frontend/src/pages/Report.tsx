import React from 'react'
import App from '../Layout'
import { RouteComponentProps, Link } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { ReportResponse } from '../../../backend/shared/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint, faRedo, faSpinner, faUndo } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from '../context'
import Editor from '../editor/Editor'
import { TReport } from '../editor/types'


interface MenuProps extends RouteComponentProps<any> {
	loading: boolean,
	enableUndo: boolean,
	enableRedo: boolean,
	undo: () => Promise<void>,
	redo: () => Promise<void>,
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
						<button type='button' className='btn btn-outline-secondary me-3'>
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
	const [loading, setLoading] = useState<boolean>(false)

	const [undoStack, setUndoStack] = useState<TReport[]>([])
	const [undoNext, setUndoNext] = useState<number>(0)

	const app = useContext(AppContext)


	async function changeData(cb: ()=>TReport): Promise<void> {
		setLoading(true)

		// save current state
		const oldUndoStack = undoStack
		const oldUndoNext = undoNext
		const oldVal = report

		// set new data locally
		const val = cb()
		
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
	}

	async function setReport2(val: TReport) {
		changeData(() => {
			setReport(val)
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
			setReport(report)
			setUndoNext(undoNext-1)
			return report
		})
	}

	async function redo() {
		changeData(() => {
			const report = undoStack[undoNext]
			setReport(report)
			setUndoNext(undoNext+1)
			return report
		})
	}


	// load report from db
	const id = props.match.params.id
	useEffect(() => {
		{
			setReport(null)
			setLoading(true)
			setUndoStack([])
			setUndoNext(0)
		}
		(async function() {
			const r = await fetch(`/.netlify/functions/report?id=${id}`, {headers: {Authorization: `Bearer sid:${app.sid}`}})
			const js = await r.json() as ReportResponse
			if (!r.ok || 'msg' in js) {
				const msg = 'msg' in js ? js.msg : 'unknown error'
				alert(msg)
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
			<FontAwesomeIcon icon={faSpinner} spin={true} style={{margin:'50px auto'}} /> 
		</main></App>
	}

	// error - not found
	if (!report) {
		return <App {...props}><main className='container'><h1>Error. Report not found</h1></main></App>
	}

	// show editor
	return <>
		<Menu
			{...props}
			loading={loading}
			enableUndo={undoNext > 1}
			enableRedo={undoNext < undoStack.length}
			undo={undo}
			redo={redo}
		/>
		<Editor
			report={report}
			setReport={setReport2}
			allReports={app.reports}
		/>
	</>
}
