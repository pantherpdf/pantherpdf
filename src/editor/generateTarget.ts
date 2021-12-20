import { ApiEndpoints, TargetOption, TReport, TReportCompiled } from '../types'
import compile from './compile'
import getOriginalSourceData, { DataObj } from './getOriginalSourceData'
import { transformData } from './DataTransform'
import makeHtml from './makeHtml'
import { encode } from './encoding'


function escapeCsv(txt: string): string {
	return txt.replaceAll('"', '""')
}


function assertUnreachableTarget(_x: never): never {
	throw new Error('Unsupported target');
}


export function makeCsv(rows: string[][], encoding: 'utf-8' | 'cp1250'): Uint8Array {
	let out = ''
	const newLine = encoding==='utf-8' ? '\n' : '\r\n'
	const cellEnclosing = '"'
	const collSeparator = ';'
	
	for (const row of rows) {
		for (let i = 0; i < row.length; ++i) {
			if (i !== 0) {
				out += collSeparator
			}
			out += cellEnclosing + escapeCsv(row[i]) + cellEnclosing
		}
		out += newLine
	}

	return encode(out, encoding)
}


export function checkCsvFormat(data: any): data is string[][] {
	if (!Array.isArray(data)) {
		return false
	}
	if (data.length === 0) {
		return true
	}
	if (!Array.isArray(data[0])) {
		return false
	}
	const numCols = data[0].length
	for (const row of data) {
		if (!Array.isArray(row)) {
			return false
		}
		if (row.length !== numCols) {
			return false
		}
		for (const cell of row) {
			if (typeof cell !== 'string') {
				return false
			}
		}
	}
	return true
}


function targetExtension(type: TargetOption): string {
	if (type === 'pdf') { return '.pdf' }
	if (type === 'html') { return '.html' }
	if (type === 'json') { return '.json' }
	if (type === 'csv-utf-8') { return '.csv' }
	if (type === 'csv-windows-1250') { return '.csv' }
	assertUnreachableTarget(type)
}


function correctExtension(filename: string | undefined, sourceType: TargetOption, targetType: TargetOption): string {
	const extTarget = targetExtension(targetType)
	if (filename) {
		const extSource = targetExtension(sourceType)
		if (extSource !== extTarget && filename.toLowerCase().endsWith(extSource)) {
			return filename.substring(0, filename.length - extSource.length) + extTarget
		}
		return filename
	}
	return `report${extTarget}`
}


interface FileOutput {
	body: Uint8Array,
	contentType: string,
	filename: string,
}

interface Args {
	report: TReport
	api: ApiEndpoints
	makePdf: (report: TReportCompiled, html: string)=>Promise<Uint8Array>
	data?: DataObj
	logPerformance?: boolean
	allowUnsafeJsEval?: boolean
	targetOverride?: TargetOption
}

export async function generateTarget(props: Args): Promise<FileOutput> {
	const {
		report,
		api,
		makePdf,
		data,
		logPerformance = false,
		allowUnsafeJsEval = false,
		targetOverride
	} = props

	const tDataBefore = logPerformance ? performance.now() : 0
	const source = await getOriginalSourceData({report, api, data, allowUnsafeJsEval})
	const inputData = await transformData(source, report, allowUnsafeJsEval)
	const tDataAfter = logPerformance ? performance.now() : 0
	if (logPerformance) { console.log(`getOriginalSourceData() + transformData() took ${(tDataAfter-tDataBefore).toFixed(0)}ms`) }

	const tCompileBefore = logPerformance ? performance.now() : 0
	const reportCompiled = await compile(report, inputData, api)
	const tCompileAfter = logPerformance ? performance.now() : 0
	if (logPerformance) { console.log(`compile() took ${(tCompileAfter-tCompileBefore).toFixed(0)}ms`) }

	const target = targetOverride || report.target
	
	// PDF
	if (target === 'pdf') {
		const tMakeHtmlBefore = logPerformance ? performance.now() : 0
		const html = makeHtml(reportCompiled)
		const tMakeHtmlAfter = logPerformance ? performance.now() : 0
		if (logPerformance) { console.log(`makeHtml() took ${(tMakeHtmlAfter-tMakeHtmlBefore).toFixed(0)}ms`) }

		const tPdfBefore = logPerformance ? performance.now() : 0
		const body = await makePdf(reportCompiled, html)
		const tPdfAfter = logPerformance ? performance.now() : 0
		if (logPerformance) { console.log(`makePdf() took ${(tPdfAfter-tPdfBefore).toFixed(0)}ms`) }

		return {
			'body': body,
			'contentType': 'application/pdf',
			'filename': correctExtension(reportCompiled.properties.fileName, reportCompiled.target, target)
		}
	}

	// html
	if (target === 'html') {
		const tMakeHtmlBefore = logPerformance ? performance.now() : 0
		const html = makeHtml(reportCompiled)
		const tMakeHtmlAfter = logPerformance ? performance.now() : 0
		if (logPerformance) { console.log(`makeHtml() took ${(tMakeHtmlAfter-tMakeHtmlBefore).toFixed(0)}ms`) }
		const encoder = new TextEncoder()
		return {
			'body': encoder.encode(html),
			'contentType': 'text/html; charset=utf-8',
			'filename': correctExtension(reportCompiled.properties.fileName, reportCompiled.target, target)
		}
	}

	// JSON
	if (target === 'json') {
		const contents = JSON.stringify(inputData)
		const encoder = new TextEncoder()
		return {
			'body': encoder.encode(contents),
			'contentType': 'application/json',
			'filename': correctExtension(reportCompiled.properties.fileName, reportCompiled.target, target)
		}
	}

	// CSV utf8
	if (target === 'csv-utf-8') {
		if (!checkCsvFormat(inputData)) {
			throw new Error('data (transformed) is not CSV compatible')
		}
		const csv = makeCsv(inputData, 'utf-8')
		return {
			'body': csv,
			'contentType': 'text/csv; charset=utf-8',
			'filename': correctExtension(reportCompiled.properties.fileName, reportCompiled.target, target)
		}
	}

	// CSV Win-1250 CP-1250
	if (target === 'csv-windows-1250') {
		if (!checkCsvFormat(inputData)) {
			throw new Error('data (transformed) is not CSV compatible')
		}
		const csv = makeCsv(inputData, 'cp1250')
		return {
			'body': csv,
			'contentType': 'text/csv; charset=windows-1250',
			'filename': correctExtension(reportCompiled.properties.fileName, reportCompiled.target, target)
		}
	}

	assertUnreachableTarget(target)
}
