/**
 * FileDialog.tsx
 * User can browse, select, upload files.
 */


import React, { useState, useContext, useEffect, useRef } from 'react'
import { AppContext } from './context'
import { Dropdown } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons'
import { TFileShort, FileUploadData, FilesResponse } from 'reports-shared'


// check browser support for fetch stream upload
// it enabled upload progress bar
// Chrome 92 requires experimental flag #enable-experimental-web-platform-features
const supportsRequestStreams = !new Request('', {
	body: new ReadableStream(),
	method: 'POST',
}).headers.has('Content-Type');


/**
 * Upload file to a server
 */
async function uploadFile(url: string, file: File, headers: {[key:string]: string}, cbProgress: (prc: number) => void) {
	let r: Response

	if (!supportsRequestStreams) {
		// old way, without progress
		r = await fetch(url, {
			method: 'POST',
			headers,
			body: file
		});
	}

	else {
		// fetch stream upload
		// report progress
		let bytesConsumed = 0
		const totalSize = file.size
		const fileReader: ReadableStreamDefaultReader = file.stream().getReader()
		const stream = new ReadableStream({
			async pull(c) {
				const r = await fileReader.read()
				if (r.done) {
					c.close()
				}
				else {
					let prc = bytesConsumed / totalSize
					cbProgress(prc)
					bytesConsumed += r.value.length
					c.enqueue(r.value)
				}
			}
		})

		r = await fetch(url, {
			method: 'POST',
			headers,
			body: stream,
			allowHTTP1ForStreamingUpload: true,  // non-standard, but required by Chrome for HTTP/1
		} as any);
	}

	// error handler
	if (!r.ok) {
		let msg: string = ''
		try {
			const js = await r.json()
			if (typeof js === 'object' && 'msg' in js && typeof js.msg === 'string') {
				msg = js.msg
			}
		}
		catch(e) { }
		if (msg.length === 0)
			msg = 'Unknown error'
		throw new Error(msg)
	}
}


interface Props {
	mode: 'value' | 'link',
	value?: string | undefined,
	onChange?: (val: string | undefined) => void,
}

type TStatus = 'waiting' | 'uploading' | 'complete'

interface Upload {
	status: TStatus,
	errorMsg?: string,
	progress?: number,
	file: File,
}

interface TFileUpload extends TFileShort {
	upload?: Upload
}


export default function FileDialog(props: Props) {
	const app = useContext(AppContext)
	const [files, setFiles] = useState<TFileUpload[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const selectFileElement = useRef<HTMLInputElement>(null)

	
	// click to browse files
	function selectFileClick() {
		if (!selectFileElement.current) {
			return
		}
		selectFileElement.current.click()
	}

	function selectFileElementChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (!e.target.files)
			return
		const arr: File[] = []
		for (let i=0; i<e.target.files.length; ++i) {
			arr.push(e.target.files[i])
		}
		e.target.value = ''
		prepareUpload(arr)
	}

	
	// drag-drop
	function onDragOver(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault()
		e.stopPropagation()
	}

	function onDrop(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault()
		e.stopPropagation()
	
		let fileUpload: File[] = []
		if (e.dataTransfer.items) {
			for (let i = 0; i < e.dataTransfer.items.length; i++) {
				if (e.dataTransfer.items[i].kind === 'file') {
					const file = e.dataTransfer.items[i].getAsFile()
					if (file) {
						fileUpload.push(file)
					}
				}
			}
		} else {
			for (let i = 0; i < e.dataTransfer.files.length; i++) {
				const file = e.dataTransfer.files[i]
				fileUpload.push(file)
			}
		}
		prepareUpload(fileUpload)
	}


	// shared upload code
	function prepareUpload(fileUpload: File[]) {
		// remove big files
		fileUpload = fileUpload.filter((f, idx) => {
			if (f.size > 5000000) {
				alert(`File ${f.name} too big`)
				return false
			}
			return true
		})
		// remove duplicate names
		fileUpload = fileUpload.filter((f, idx) => idx === fileUpload.findIndex((f2) => f2.name === f.name))

		// empty?
		if (fileUpload.length === 0)
			return

		// add to list
		const files2 = files.filter((f) => {
			// name exists
			const newFile = fileUpload.find(f2 => f2.name === f.name)
			return !newFile
		})
		// combine
		const fileUpload2: TFileUpload[] = fileUpload.map(f => {
			return {
				name: f.name,
				mimeType: f.type,
				uploadTime: new Date().toISOString().substring(0,19)+'Z',
				modifiedTime: new Date(f.lastModified).toISOString().substring(0,19)+'Z',
				size: f.size,
				upload: {
					status: 'waiting',
					file: f,
				},
			}
		})
		files2.splice(files2.length, 0, ...fileUpload2)
		setFiles(files2)

		// do not call doUpload() because files is not ready yet
		// it will get called by useEffect()
	}

	function reportStatus(name: string, status: TStatus, errorMsg?: string, progress?: number) {
		const idx = files.findIndex(f2 => f2.name === name)
		if (idx === -1)
			return
		const oldUpload = files[idx].upload
		if (!oldUpload)
			throw new Error('missing property upload')
		const files2 = [...files]
		const upload: Upload = { ...oldUpload, status, }
		if (errorMsg)
			upload.errorMsg = errorMsg
		else
			delete upload.errorMsg
		if (progress)
			upload.progress = progress
		else
			delete upload.progress
		files2[idx] = {
			...files2[idx],
			upload,
		}
		setFiles(files2)
	}

	async function doUpload(f: TFileUpload) {
		reportStatus(f.name, 'uploading')

		if (!f.upload)
			throw new Error('Missing upload')

		try {
			const dt: FileUploadData = {
				name: f.name,
				modifiedTime: f.modifiedTime,
				mimeType: f.mimeType,
			}
			const headers = {
				Authorization: `Bearer sid:${app.sid}`,
				'x-data': JSON.stringify(dt),
				// use non-descriptive binary Content-Type otherwise netlify lambda not working properly with images
				'Content-Type': 'application/octet-stream',
			}
			await uploadFile(`/.netlify/functions/filesUpload`, f.upload.file, headers, (prc) => {
				reportStatus(f.name, 'uploading', undefined, prc)
			})
			reportStatus(f.name, 'complete')
		}
		catch(e) {
			const msg = e instanceof Error ? e.message : 'unknown error'
			reportStatus(f.name, 'complete', msg)
		}
	}

	// check to start upload
	useEffect(() => {
		const f = files.find(f => f.upload && (f.upload.status === 'waiting' || f.upload.status === 'uploading'))
		if (f && f.upload && f.upload.status === 'waiting')
			doUpload(f)
		// eslint-disable-next-line
	}, [files])


	// load keys
	useEffect(() => {
		(async function() {
			const r = await fetch('/.netlify/functions/files', {headers: {Authorization: `Bearer sid:${app.sid}`}})
			const js = await r.json() as FilesResponse
			if (!r.ok || 'msg' in js) {
				const msg = 'msg' in js ? js.msg : 'unknown error'
				throw new Error(msg)
			}
			setFiles(js.files)
			setLoading(false)
		})()
	}, [app.sid])


	async function fileDelete(name: string): Promise<void> {
		if (!window.confirm('Are you sure to delete?'))
			return
		const r = await fetch(`/.netlify/functions/filesDelete?name=${name}`, {method:'POST', headers: {Authorization: `Bearer sid:${app.sid}`}})
		const js = await r.json() as FilesResponse
		if (!r.ok || 'msg' in js) {
			const msg = 'msg' in js ? js.msg : 'unknown error'
			alert(msg)
			return
		}
		const arr = files.filter(f => f.name !== name)
		setFiles(arr)
	}


	return <>
		<table className="table table-striped">
			<thead>
				<tr>
					<th>Name</th>
					<th style={{width:'220px'}}>Uploaded</th>
					<th style={{width:'220px'}}>Modified</th>
					<th style={{width:'100px'}}>Size</th>
					<td style={{width:'100px'}}></td>
				</tr>
			</thead>
			<tbody>
				{files.map(f => <tr key={f.name}>
					<td>
						{props.mode === 'link' ? <a href={`/.netlify/functions/filesDownload?name=${f.name}&sid=${app.sid}`} target='_blank' rel='noreferrer' className='d-block'>{f.name}</a> : <button
							className='btn btn-link d-block w-100 text-start'
							onClick={() => props.onChange && props.onChange(f.name)}
						>
							{f.name}
						</button>}
						{f.upload && <>
							{f.upload.status === 'waiting' && <div>waiting</div>}
							{f.upload.status === 'complete' && <>
								{f.upload.errorMsg ? <div className='text-danger'>{f.upload.errorMsg}</div> : <div className='text-success'>Upload complete</div>}
							</>}
							{f.upload.status === 'uploading' && <>
								<div>Uploading ... <FontAwesomeIcon icon={faSpinner} spin={true} className='ms-2' /></div>
								{supportsRequestStreams && <div className="progress">
									<div className="progress-bar" role="progressbar" style={{width:((f.upload.progress||0)*100).toString()+'%'}}></div>
								</div>}
							</>}
						</>}
					</td>
					<td>
						<small>{f.uploadTime}</small>
					</td>
					<td>
						<small>{f.modifiedTime}</small>
					</td>
					<td>
						{f.size}
					</td>
					<td>
						<Dropdown>
							<Dropdown.Toggle style={{maxWidth:'3rem'}} split variant="outline-secondary" size='sm' />
							<Dropdown.Menu>
								<Dropdown.Item onClick={()=>fileDelete(f.name)}>
									<FontAwesomeIcon icon={faTrash} className='me-2' fixedWidth />
									Delete
								</Dropdown.Item>
								{/*
								<Dropdown.Item onClick={()=>{}}>
									<FontAwesomeIcon icon={faPen} className='me-2' fixedWidth />
									Rename
								</Dropdown.Item>
								*/}
							</Dropdown.Menu>
						</Dropdown>
					</td>
				</tr>)}
			</tbody>
		</table>

		{loading && <FontAwesomeIcon icon={faSpinner} spin={true} className='ms-2' />}

		<div
			className='mt-4 mb-4 d-flex flex-column p-4' style={{border:'3px dashed rgba(0,50,160,0.2)'}}
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			<div className='text-center'>Drop files here</div>
			<div className='text-center mt-2 text-muted'>or</div>
			<div className='text-center mt-2'><button className='btn btn-sm btn-outline-primary' onClick={selectFileClick}>Select files</button></div>
		</div>
		<input type='file' className='d-none' ref={selectFileElement} onChange={selectFileElementChange} />
	</>
}
