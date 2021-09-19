import { ApiEndpoints, TReport } from "../types"


export async function getDataFromObj(obj: {mimeType: string, data: ArrayBuffer}): Promise<unknown> {
	if (obj.mimeType === 'text/javascript' || obj.mimeType === 'application/javascript') {
		// cannot import module because import() gets transformed into something else
		//const module = await import(url)
		
		// cannot eval and import because nodejs doesnt support importing from http://
		//const enc = encodeURIComponent(url)
		//const prms = eval(`import("${decodeURIComponent(enc)}")`)
		//const module = await prms
		//const getData = module.default
		//return getData()

		//
		const code = new TextDecoder('utf-8').decode(obj.data)
		// eslint-disable-next-line
		const a = eval(code+';;;;{getData();}')
		const data = await a
		return data
	}
	if (obj.mimeType === 'application/json') {
		const code = new TextDecoder('utf-8').decode(obj.data)
		return JSON.parse(code)
	}
	throw new Error(`Invalid response. Content-Type: ${obj.mimeType}`)
}


export async function getDataFromUrl(url: string): Promise<unknown> {
	const r = await fetch(url, {
		headers: {
			Accept: 'text/javascript, application/json'
		},
	})
	if (r.status !== 200) {
		throw new Error(`Bad response status: ${r.status}`)
	}
	const ct = (r.headers.get('Content-Type') || '').split(';')[0].trim()
	const data = await r.arrayBuffer()
	return await getDataFromObj({mimeType: ct, data})
}


export default async function getOriginalSourceData(report: TReport, api: ApiEndpoints, data: unknown, dataUrl: string|undefined): Promise<unknown> {
	if (data !== undefined) {
		return data
	}
	if (dataUrl) {
		return getDataFromUrl(dataUrl)
	}
	if (report.dataUrl.length > 0) {
		let url = report.dataUrl
		if (url.startsWith('local/')) {
			if (!api.filesDownload) {
				throw new Error('missing api filesDownload')
			}
			const obj = await api.filesDownload(url.substring(6))
			return await getDataFromObj(obj)
		}
		return getDataFromUrl(url)
	}
	return undefined
}
