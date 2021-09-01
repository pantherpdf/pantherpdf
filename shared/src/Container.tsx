import React from 'react'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint, faRedo, faSpinner, faUndo } from '@fortawesome/free-solid-svg-icons'
import { ApiEndpoints, ReportTypeGuard, TReport } from './types'
import packageJson from '../package.json'
import Editor from './editor/Editor'
import { sampleReport } from './editor/sampleReport'
import { Modal } from 'react-bootstrap'
import Trans from './translation'
import compile from './editor/compile'
import makeHtml from './editor/makeHtml'
import getOriginalSourceData from './editor/getOriginalSourceData'
import { transformData } from './editor/DataTransform'
import { TSourceData } from './editor/types'


interface MenuProps {
	homeUrl: string | null,
	loading: boolean,
	enableUndo: boolean,
	enableRedo: boolean,
	undo: () => Promise<void>,
	redo: () => Promise<void>,
	print: () => Promise<void>,
}

function Menu(props: MenuProps) {
	return <>
		<header className='border-bottom mb-3 fixed-top'>
			<div className='container'>
				<div className='d-flex py-2'>
					<ul className='nav flex-grow-1'>
						{props.homeUrl && <li>
							<a href={props.homeUrl} target='_parent' className='nav-link px-3 link-secondary'>
								Kelgrand Reports
							</a>
						</li>}
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
							{/*<li><button className='btn nav-link px-3 link-secondary' onClick={async () => { await app.logout(); props.history.push('/login')}}>Logout</button></li>*/}
						</ul>
					</div>
				</div>
			</div>
		</header>
		<div style={{height:'60px'}} />
	</>
}




export default function Container() {
	const [report, setReport] = useState<TReport | null>()
	const [loading, setLoading] = useState<boolean>(true)

	const [undoStack, setUndoStack] = useState<TReport[]>([])
	const [undoNext, setUndoNext] = useState<number>(0)

	const [shownModalPrint, setShownModalPrint] = useState<React.ReactNode | string | undefined>(undefined)
	const [data, setData] = useState<TSourceData>({data: undefined})
	const [overrideSourceData, setOverrideSourceData] = useState<string | undefined>(undefined)

	const url = new URL(window.location.href)
	const params = new URLSearchParams(url.search);
	const homeUrl = params.get('homeUrl')
	const getUrl = params.get('getUrl')
	const updateUrl = params.get('updateUrl')
	const deleteUrl = params.get('deleteUrl')
	const api: ApiEndpoints = {
		fonts: async () => { return ['arial', 'times new roman'] },
	}


	// refresh data
	useEffect(() => {
		if (report) {
			(async function() {
				try {
					const dt1 = await getOriginalSourceData(report, overrideSourceData, api)
					const dt2 = await transformData(dt1, report)
					setData({data: dt2})
				}
				catch(e) {
					setData({data: undefined, errorMsg: String(e)})
				}
			})()
		}
		else {
			setData({data: undefined})
		}
		// eslint-disable-next-line
	}, [overrideSourceData, report?.dataUrl, report?.transforms])

	async function setOverrideSourceData2(data: any) {
		if (typeof data !== 'undefined') {
			setOverrideSourceData(JSON.stringify(data))
		}
		else {
			setOverrideSourceData(undefined)
		}
	}


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
		if (updateUrl) {
			try {
				const r = await fetch(updateUrl, {method:'POST', headers: {'Content-Type':'application/json'}, body:JSON.stringify(val)})
				if (!r.ok) {
					throw new Error('unknown error')
				}
			}
			catch(e) {
				setLoading(false)
				alert(String(e))
				setReport(oldVal)
				setUndoStack(oldUndoStack)
				setUndoNext(oldUndoNext)
				return
			}
		}

		// ok
		setLoading(false)
	}

	async function setReport2(val: TReport) {
		// setReport() as soon as possible, otherwise TextHtml changes caret
		setReport(val)
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
		if (!deleteUrl) {
			return
		}
		// delete from db
		const r = await fetch(deleteUrl, {method:'DELETE'})
		if (!r.ok) {
			alert('error')
			return
		}
		
		// redirect
		if (homeUrl) {
			window.location.replace(homeUrl)
		}
		else {
			setReport(undefined)
			setUndoStack([])
			setUndoNext(0)
		}
	}

	async function print() {
		if (!report) {
			return
		}
		try {
			const source = await getOriginalSourceData(report, overrideSourceData, api)
			const data = await transformData(source, report)
			const c = await compile(report, data, api)
			const nodes = makeHtml(c)
			setShownModalPrint(nodes)
		}
		catch(e) {
			setShownModalPrint(String(e))
		}
	}


	// load report from db
	useEffect(() => {
		setReport(null)
		setLoading(true)
		setUndoStack([])
		setUndoNext(0);

		(async function() {
			try {
				if (!getUrl) {
					const report = sampleReport
					setReport(report)
					setUndoStack([report])
					setUndoNext(1)
					return
				}
				const r = await fetch(getUrl)
				if (!r.ok) {
					const msg = await r.text()
					alert(msg)
					return
				}
				const report = await r.json()
				if (!ReportTypeGuard(report)) {
					alert('Bad data')
					return
				}
				const myVersion = packageJson.version.split('.')[0]
				const docVersion = report.version.split('.')[0]
				if (docVersion !== myVersion) {
					alert(`Bad version. Expected ${myVersion} but got ${docVersion}`)
					return
				}
				setReport(report)
				setUndoStack([report])
				setUndoNext(1)
			}
			catch(e) {
				alert(String(e))
				return
			}
			finally {
				setLoading(false)
			}
		})()
	}, [getUrl])

	
	// is loading?
	if (!report && loading) {
		return <main className='container'>
			<div className='d-flex justify-content-center'>
				<FontAwesomeIcon icon={faSpinner} spin={true} style={{margin:'50px auto', fontSize:'2rem'}} /> 
			</div>
		</main>
	}

	// error - not found
	if (!report) {
		return <main className='container'><h1>Error.</h1></main>
	}
	// show editor
	return <>
		<Menu
			homeUrl={homeUrl}
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
			deleteReport={deleteUrl ? deleteReport : undefined}
			api={api}
			setOverrideSourceData={setOverrideSourceData2}
			getOriginalSourceData={() => getOriginalSourceData(report, overrideSourceData, api)}
			isOverridenSourceData={!!overrideSourceData}
			data={data}
		/>

		{/* ADD NEW */}
		<Modal show={!!shownModalPrint} onHide={() => setShownModalPrint(undefined)} size='lg'>
			<Modal.Header closeButton>
				<Modal.Title>
					{Trans('preview')}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{shownModalPrint}
			</Modal.Body>
		</Modal>
	</>
}
