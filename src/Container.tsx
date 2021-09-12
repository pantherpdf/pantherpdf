import React from 'react'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf, faPrint, faRedo, faSpinner, faUndo } from '@fortawesome/free-solid-svg-icons'
import { ApiEndpoints, FilesResponseBase, ReportTypeGuard, TReport } from './types'
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
import { uploadFile } from './FileDialog'


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
		<header className='border-bottom mb-3 fixed-top bg-white'>
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

	const [shownModalPrint, setShownModalPrint] = useState<{html: string} | {errorMsg: string} | undefined>(undefined)
	const [data, setData] = useState<TSourceData>({data: undefined})
	const [overrideSourceData, setOverrideSourceData] = useState<string | undefined>(undefined)

	const url = new URL(window.location.href)
	const params = new URLSearchParams(url.search);
	const homeUrl = params.get('home')
	const reportUrl = params.get('report')
	const auth = params.get('auth')
	const reportEditable = params.get('reportEditable')===null || params.get('reportEditable') === '1' || params.get('reportEditable') === 'true'
	const loadLocalReport = params.get('loadLocalReport') === '1' || params.get('loadLocalReport') === 'true'
	const generatePdfUrl = params.get('generatePdf')
	const filesUrl = params.get('files')
	const filesDownloadUrl = params.get('filesDownload')
	if (filesUrl && filesUrl.indexOf(':name') === -1) {
		throw new Error('Missing :name in url files')
	}
	if (filesDownloadUrl && filesDownloadUrl.indexOf(':name') === -1) {
		throw new Error('Missing :name in url filesDownloadUrl')
	}
	const api: ApiEndpoints = {
		fonts: async () => { return ['arial', 'times new roman'] },
		files: (filesUrl ? async () => {
			let url = filesUrl.replace(':name', '')
			const r = await fetch(url, {
				headers: {
					...(auth && { 'Authorization': auth }),
				},
			})
			if (!r.ok) {
				const txt = await r.text()
				throw new Error(txt)
			}
			const js = await r.json() as FilesResponseBase
			return js
		} : undefined),
		filesDelete: (filesUrl ? async (name) => {
			let url = filesUrl.replace(':name', '')
			const r = await fetch(url, {
				method: 'DELETE',
				headers: {
					...(auth && { 'Authorization': auth }),
				},
			})
			if (!r.ok) {
				const txt = await r.text()
				throw new Error(txt)
			}
		} : undefined),
		filesUpload: (filesUrl ? async (file, data, cbProgress) => {
			let url = filesUrl.replace(':name', encodeURIComponent(data.name))
			uploadFile(url, file, {
				'x-data': JSON.stringify(data),
				...(auth ? {'Authorization': auth} : {}),
			}, cbProgress)
		} : undefined),
		filesDownloadUrl: (filesDownloadUrl ? (name) => {
			return filesDownloadUrl.replace(':name', encodeURIComponent(name))
		} : undefined),
	}


	//
	async function getOrigSourceInternal(): Promise<any> {
		if (overrideSourceData) {
			return JSON.parse(overrideSourceData)
		}
		if (report) {
			return getOriginalSourceData(report, api, undefined, undefined)
		}
		return undefined
	}

	// refresh data
	useEffect(() => {
		if (report) {
			(async function() {
				try {
					const dt1 = await getOrigSourceInternal()
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
		if (reportEditable && reportUrl) {
			try {
				const r = await fetch(reportUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						...(auth && { 'Authorization': auth }),
					},
					body: JSON.stringify(val)
				})
				if (!r.ok) {
					throw new Error('unknown error')
				}
			}
			catch (e) {
				setLoading(false)
				alert(String(e))
				setReport(oldVal)
				setUndoStack(oldUndoStack)
				setUndoNext(oldUndoNext)
				return
			}
		}

		// save to local storage
		if (loadLocalReport) {
			window.localStorage.setItem('report', JSON.stringify(val))
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
		if (!reportEditable || !reportUrl) {
			return
		}
		// delete from db
		const r = await fetch(reportUrl, {
			method:'DELETE',
			headers: {
				...(auth && { 'Authorization': auth }),
			},
		})
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
			const source = await getOrigSourceInternal()
			const data = await transformData(source, report)
			const c = await compile(report, data, api, {})
			const html = makeHtml(c)
			setShownModalPrint({html})
		}
		catch(e) {
			setShownModalPrint({errorMsg: String(e)})
		}
	}

	async function genPdf() {
		if (!generatePdfUrl || !report || !reportUrl) {
			return
		}
		interface GenPdfRequest {
			dataUrl?: string,
			data?: any,
		}
		interface GenPdfResponse {
			url: string,
		}
		const rq: GenPdfRequest = {
			...(overrideSourceData ? {data: JSON.parse(overrideSourceData)} : {}),
		}
		try {
			const r = await fetch(generatePdfUrl, {
				headers: {
					'Content-Type': 'application/json',
					...(auth ? {'Authorization': auth} : {}),
				},
				body: JSON.stringify(rq),
			})
			if (!r.ok) {
				const txt = await r.text()
				throw new Error(txt)
			}
			const js = await r.json() as GenPdfResponse
			window.location.href = js.url
		}
		catch (e) {
			alert(`Error: ${String(e)}`)
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
				if (loadLocalReport) {
					const reportTxt = window.localStorage.getItem('report')
					const report = (reportTxt && reportTxt.length > 0) ? JSON.parse(reportTxt) : null
					if (ReportTypeGuard(report)) {
						setReport(report)
						setUndoStack([report])
						setUndoNext(1)
						return
					}
				}
				if (!reportUrl) {
					const report = sampleReport
					setReport(report)
					setUndoStack([report])
					setUndoNext(1)
					return
				}
				const r = await fetch(reportUrl, {
					headers: {
						...(auth && { 'Authorization': auth }),
					},
				})
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
	}, [reportUrl, auth, loadLocalReport])

	
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
			deleteReport={(reportUrl && reportEditable) ? deleteReport : undefined}
			api={api}
			setOverrideSourceData={setOverrideSourceData2}
			getOriginalSourceData={getOrigSourceInternal}
			isOverridenSourceData={!!overrideSourceData}
			data={data}
		/>

		{/* Preview */}
		<Modal show={!!shownModalPrint} onHide={() => setShownModalPrint(undefined)} size='lg'>
			<Modal.Header closeButton>
				<Modal.Title>
					{Trans('preview')}
					{!!generatePdfUrl && !!report && !!reportUrl && (
						<button
							className='btn btn-outline-secondary'
							onClick={genPdf}
						>
							<FontAwesomeIcon icon={faFilePdf} />
						</button>
					)}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{!!shownModalPrint && 'html' in shownModalPrint && (
					<iframe
						srcDoc={shownModalPrint.html}
						style={{width: '100%', height: '83vh'}}
						title='preview'
					/>
				)}
				{!!shownModalPrint && 'errorMsg' in shownModalPrint && (
					<div className='alert alert-danger'>
						{shownModalPrint.errorMsg}
					</div>
				)}
			</Modal.Body>
		</Modal>
	</>
}
