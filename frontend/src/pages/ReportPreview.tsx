/**
 * ReportPreview.tsx
 * Show preview of a finished report and button to get PDF
 */


import React, { useState, useContext } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from '../context'


type RouteParams = { accessKey: string }

export default function ReportPreview(props: RouteComponentProps<RouteParams>) {
	const [loading, setLoading] = useState<boolean>(false)
	const app = useContext(AppContext)
	const accessKey = props.match.params.accessKey
	
	async function doPrint() {
		if (!app.sid)
			return
		// todo
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
