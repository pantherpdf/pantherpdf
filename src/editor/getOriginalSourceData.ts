import { ApiEndpoints, TReport } from "../types"


export type DataTypes = 'as-is' | 'javascript' | 'url'
export type DataObj = { value: unknown, type: DataTypes }
interface Args {
	report: TReport
	api: ApiEndpoints
	data?: DataObj
	allowUnsafeJsEval?: boolean
}


async function dataFromObj(value: unknown, type: DataTypes, allowUnsafeJsEval: boolean): Promise<unknown> {
	if (type === 'as-is') {
		return value
	}

	if (type === 'javascript') {
		if (!allowUnsafeJsEval) {
			throw new Error('Evaluating JS is disabled')
		}
		if (typeof value !== 'string') {
			throw new Error('JS code should be string')
		}
		return evalJs(value)
	}

	if (type === 'url') {
		if (typeof value !== 'string') {
			throw new Error('JS code should be string')
		}
		return getDataFromUrl(value, allowUnsafeJsEval)
	}

	throw new Error('Unknown data type')
}


async function evalJs(code: string): Promise<unknown> {
	// cannot import module because import() gets transformed into something else
	//const module = await import(url)
	
	// cannot eval and import because nodejs doesnt support importing from http://
	//const enc = encodeURIComponent(url)
	//const prms = eval(`import("${decodeURIComponent(enc)}")`)
	//const module = await prms
	//const getData = module.default
	//return getData()

	// eslint-disable-next-line
	const a = eval(code)
	const data = await a
	return data
}


export async function getDataFromUrl(url: string, allowUnsafeJsEval: boolean): Promise<unknown> {
	if (!url.startsWith('http://') && !url.startsWith('https://')) {
		throw new Error('Only absolute url is allowed')
	}
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
		const code = await r.text()
		return dataFromObj(code, 'javascript', allowUnsafeJsEval)
	}
	if (ct === 'application/json') {
		const data = await r.json()
		return dataFromObj(data, 'as-is', allowUnsafeJsEval)
	}
	throw new Error('unsupported data content-type')
}


export default async function getOriginalSourceData(args: Args): Promise<unknown> {
	const {
		report,
		api,
		data,
		allowUnsafeJsEval = false
	} = args;

	if (data) {
		return dataFromObj(data.value, data.type, allowUnsafeJsEval)
	}
	if (report.dataUrl.length > 0) {
		let url = report.dataUrl
		if (url.startsWith('local/')) {
			if (!api.filesDownload) {
				throw new Error('missing api filesDownload')
			}
			const obj = await api.filesDownload(url.substring(6))
			if (obj.mimeType === 'text/javascript' || obj.mimeType === 'application/javascript') {
				const code = new TextDecoder('utf-8').decode(obj.data)
				return dataFromObj(code, 'javascript', allowUnsafeJsEval)
			}
			if (obj.mimeType === 'application/json') {
				const data = new TextDecoder('utf-8').decode(obj.data)
				return dataFromObj(data, 'as-is', allowUnsafeJsEval)
			}
			throw new Error('unsupported data content-type')
		}
		return getDataFromUrl(url, allowUnsafeJsEval)
	}
	return undefined
}
