/**
 * FileDialog.tsx
 * User can browse, select, upload files.
 */


import React, { useState, useEffect } from 'react'
import { Dropdown } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons'
import { TFileShort, FileUploadData } from './types'
import { ApiEndpoints } from './types'
import FileSelect from './FileSelect'
import Trans from './translation'


// check browser support for fetch stream upload
// it enabled upload progress bar
// Chrome 92 requires experimental flag #enable-experimental-web-platform-features
const supportsRequestStreams: boolean = typeof window!=='undefined' && window.Request!==undefined && window.ReadableStream!==undefined && !new window.Request('', { body: new window.ReadableStream(), method: 'POST' }).headers.has('Content-Type');


export async function uploadFile(url: string, file: File, headers: {[key:string]: string}, cbProgress: (prc: number) => void) {
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
		const fileReader: ReadableStreamDefaultReader = (file.stream() as any).getReader()
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
		return Promise.reject(msg)
	}
}


interface Props {
	mode: 'value' | 'link',
	value?: string | undefined,
	onChange?: (val: string | undefined) => void,
	api: ApiEndpoints,
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
	const [files, setFiles] = useState<TFileUpload[]>([])
	const [loading, setLoading] = useState<boolean>(true)


	// shared upload code
	function prepareUpload(fileUpload: File[]) {
		// remove big files
		fileUpload = fileUpload.filter((f, idx) => {
			if (f.size > 5000000) {
				alert(Trans('file -name- too big', [f.name]))
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

		if (!f.upload || !props.api.filesUpload)
			throw new Error('Missing upload')

		try {
			const dt: FileUploadData = {
				name: f.name,
				modifiedTime: f.modifiedTime,
				mimeType: f.mimeType,
			}
			await props.api.filesUpload(f.upload.file, dt, (prc) => {
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


	// load files
	useEffect(() => {
		if (!props.api.files) {
			return
		}
		props.api.files().then(js => {
			setFiles(js.files)
			setLoading(false)
		})
	}, [props.api])


	async function fileDelete(name: string): Promise<void> {
		if (!props.api.filesDelete)
			return
		if (!window.confirm(Trans('delete confirm', [name])))
			return
		await props.api.filesDelete(name)
		const arr = files.filter(f => f.name !== name)
		setFiles(arr)
	}


	return <>
		<table className="table table-striped">
			<thead>
				<tr>
					<th>{Trans('name')}</th>
					<th style={{width:'220px'}}>{Trans('uploaded')}</th>
					<th style={{width:'220px'}}>{Trans('modified')}</th>
					<th style={{width:'100px'}}>{Trans('size')}</th>
					<td style={{width:'100px'}}></td>
				</tr>
			</thead>
			<tbody>
				{files.map(f => <tr key={f.name}>
					<td>
						{props.mode === 'link' && props.api.filesDownloadUrl ? <a href={props.api.filesDownloadUrl(f.name)} target='_blank' rel='noreferrer' className='d-block'>{f.name}</a> : <button
							className='btn btn-link d-block w-100 text-start'
							onClick={() => props.onChange && props.onChange(f.name)}
							disabled={f.upload && f.upload.status !== 'complete'}
						>
							{f.name}
						</button>}
						{f.upload && <>
							{f.upload.status === 'waiting' && (
								<div>
									{Trans('waiting')}
								</div>
							)}
							{f.upload.status === 'complete' && <>
								{f.upload.errorMsg ? (
									<div className='text-danger'>
										{f.upload.errorMsg}
									</div>
								 ) : (
								 	<div className='text-success'>
										{Trans('upload complete')}
									</div>
								 )}
							</>}
							{f.upload.status === 'uploading' && <>
								<div>
									{Trans('uploading...')}
									<FontAwesomeIcon icon={faSpinner} spin={true} className='ms-2' />
								</div>
								{supportsRequestStreams && (
									<div className="progress">
										<div
											className="progress-bar"
											role="progressbar"
											style={{width:((f.upload.progress||0)*100).toString()+'%'}}
										/>
									</div>
								)}
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
									{Trans('delete')}
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

		<FileSelect
			onSelect={fls => prepareUpload(fls)}
		/>
	</>
}
