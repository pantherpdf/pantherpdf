/**
 * ReportPreview.tsx
 * Show preview of a finished report and button to get PDF
 */


import React, { useState, useContext } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from '../context'
import type { GeneratePdfResponse } from '../../../backend/src/types'


function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


type RouteParams = { accessKey: string }

export default function ReportPreview(props: RouteComponentProps<RouteParams>) {
	const [loading, setLoading] = useState<boolean>(false)
	const app = useContext(AppContext)
	const accessKey = props.match.params.accessKey
	
	async function doPrint() {
		if (!app.sid)
			return

		const w = window.open('', '_blank')
		if (!w)
			return
		
		setLoading(true)

		let js: GeneratePdfResponse
		
		// send request
		const r = await fetch(`/.netlify/functions/generatePdf?key=${encodeURIComponent(accessKey)}`, {method: 'POST', headers: {Authorization: `Bearer sid:${app.sid}`}})
		js = await r.json() as GeneratePdfResponse
		if (!r.ok || 'msg' in js) {
			const msg = 'msg' in js ? js.msg : 'unknown error'
			setLoading(false)
			w.close()
			alert(msg)
			return
		}

		while (js.status !== 'finished') {
			// sleep
			await sleep(800)

			// request status update
			const r = await fetch(`/.netlify/functions/generatePdfStatus?pdfId=${encodeURIComponent(js.id)}`, {method: 'POST', headers: {Authorization: `Bearer sid:${app.sid}`}})
			js = await r.json() as GeneratePdfResponse
			if (!r.ok || 'msg' in js) {
				const msg = 'msg' in js ? js.msg : 'unknown error'
				setLoading(false)
				w.close()
				alert(msg)
				return
			}
		}

		// error?
		if (js.errorMsg) {
			setLoading(false)
			w.close()
			alert(js.errorMsg)
			return
		}

		// ok
		setLoading(false)
		w.location.href = `${window.location.origin}/.netlify/functions/generatePdfDownload?pdfId=${encodeURIComponent(js.id)}`
	}

	return <>
		<header className={`border-bottom mb-3 fixed-top`}>
			<div className='container'>
				<div className='d-flex py-2'>
					<ul className='nav flex-grow-1'>
					</ul>
					<div>
						{app.sid !== null && <button type='button' className='btn btn-outline-secondary me-3' onClick={doPrint}>
							<FontAwesomeIcon icon={faPrint} fixedWidth />
						</button>}
						{loading && <FontAwesomeIcon icon={faSpinner} spin />}
					</div>
					<div className='flex-grow-1 d-flex justify-content-end'>
						<ul className='nav'>
						</ul>
					</div>
				</div>
			</div>
		</header>
		<iframe
			src={`/.netlify/functions/generateShow?key=${accessKey}`}
			title='report'
			width="100%"
			height="100%"
			frameBorder="0"
			style={{
				position: 'fixed',
				top: '60px',
				left: '0',
				right: '0',
				bottom: '0',
			}}
		/>
	</>
}
