import { ApiEndpoints, TReport } from "../types"


export async function getDataFromUrl(url: string) {
	const r = await fetch(url, {
		headers: {
			Accept: 'text/javascript, application/json'
		},
	})
	if (r.status !== 200) {
		throw new Error(`Bad response status: ${r.status}`)
	}
	const ct = (r.headers.get('Content-Type') || '').split(';')[0].trim()
	if (ct === 'text/javascript' || ct === 'application/javascript') {
		// cannot import module because import() gets transformed into something else
		//const module = await import(url)
		
		// cannot eval and import because nodejs doesnt support importing from http://
		//const enc = encodeURIComponent(url)
		//const prms = eval(`import("${decodeURIComponent(enc)}")`)
		//const module = await prms
		//const getData = module.default
		//return getData()

		//
		const code = await r.text()
		// eslint-disable-next-line
		const a = eval(code+';;;;{getData();}')
		const data = await a
		return data
	}
	if (ct === 'application/json') {
		return r.json()
	}
	throw new Error(`Invalid response. Content-Type: ${ct}`)
}


export default async function getOriginalSourceData(report: TReport, api: ApiEndpoints, data: any, dataUrl: string|undefined): Promise<any> {
	if (data !== undefined) {
		return data
	}
	if (dataUrl) {
		return getDataFromUrl(dataUrl)
	}
	if (report.dataUrl.length > 0) {
		let url = report.dataUrl
		if (url.startsWith('local/')) {
			if (!api.filesDownloadUrl) {
				throw new Error('missing api filesDownloadUrl')
			}
			url = api.filesDownloadUrl(url.substring(6))
			if (url.length === 0) {
				throw new Error('got empty url from api filesDownloadUrl')
			}
		}
		return getDataFromUrl(url)
	}
	return undefined
}
