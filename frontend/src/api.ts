import { ApiEndpoints, ReportResponse, FilesResponse, FileUploadData } from 'reports-shared'
import { IAppContextCB } from './context'


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



export default function getApi(app: IAppContextCB): ApiEndpoints {
	const api: ApiEndpoints = {
		reportGet: async (id: string) => {
			const r = await fetch(`/.netlify/functions/report?id=${encodeURIComponent(id)}`, {headers: {Authorization: `Bearer sid:${app.sid}`}})
			const js = await r.json() as ReportResponse
			if (!r.ok || 'msg' in js) {
				const msg = 'msg' in js ? js.msg : 'unknown error'
				throw new Error(msg)
			}
			return js
		},

		files: async () => {
			const r = await fetch('/.netlify/functions/files', {headers: {Authorization: `Bearer sid:${app.sid}`}})
			const js = await r.json() as FilesResponse
			if (!r.ok || 'msg' in js) {
				const msg = 'msg' in js ? js.msg : 'unknown error'
				throw new Error(msg)
			}
			return js
		},

		filesUpload: async (file: File, data: FileUploadData, cbProgress: (prc: number) => void) => {
			const headers = {
				Authorization: `Bearer sid:${app.sid}`,
				'x-data': JSON.stringify(data),
				// use non-descriptive binary Content-Type otherwise netlify lambda not working properly with images
				'Content-Type': 'application/octet-stream',
			}
			await uploadFile(`/.netlify/functions/filesUpload`, file, headers, cbProgress)
		},

		filesDelete: async (name: string) => {
			const r = await fetch(`/.netlify/functions/filesDelete?name=${encodeURIComponent(name)}`, {method:'POST', headers: {Authorization: `Bearer sid:${app.sid}`}})
			const js = await r.json() as FilesResponse
			if (!r.ok || 'msg' in js) {
				const msg = 'msg' in js ? js.msg : 'unknown error'
				alert(msg)
				return
			}
		},

		filesDownloadUrl: (name: string) => {
			return `/.netlify/functions/filesDownload?name=${encodeURIComponent(name)}&sid=${encodeURIComponent(app.sid||'')}`
		},
	}
	return api
}
