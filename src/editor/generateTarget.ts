import { ApiEndpoints, TReport, TReportCompiled } from '../types'
import compile from './compile'
import getOriginalSourceData from './getOriginalSourceData'
import { transformData } from './DataTransform'
import makeHtml from './makeHtml'
import iconv from 'iconv-lite'


function escapeCsv(txt: string): string {
	return txt.replaceAll('"', '""')
}


function assertUnreachableTarget(_x: never): never {
	throw new Error('Unsupported target');
}


export function makeCsv(rows: string[][], encoding: 'UTF-8' | 'CP1250'): Buffer {
	const newLine = Buffer.from( (encoding.toLowerCase()==='utf-8' || encoding.toLowerCase()==='utf8') ? '\n' : '\r\n' );
	const cellEncosing = Buffer.from('"')
	const collSeparator = Buffer.from(';')
	const out: Buffer[] = []
	for (const row of rows) {
		for (let i = 0; i < row.length; ++i) {
			if (i != 0) {
				out.push(collSeparator)
			}
			out.push(cellEncosing)
			const txt = escapeCsv(row[i])
			out.push(iconv.encode(txt, encoding))
			out.push(cellEncosing)
		}
		out.push(newLine)
	}
	return Buffer.concat(out)
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


interface FileOutput {
	body: Uint8Array,
	contentType: string,
	filename: string,
}
export async function generateTarget(report: TReport, api: ApiEndpoints, data: unknown, dataUrl: string|undefined, logPerformance: boolean, makePdf: (report: TReportCompiled, html: string)=>Promise<Uint8Array>): Promise<FileOutput> {
	const tDataBefore = logPerformance ? performance.now() : 0
	const source = await getOriginalSourceData(report, api, data, dataUrl)
	const inputData = await transformData(source, report)
	const tDataAfter = logPerformance ? performance.now() : 0
	if (logPerformance) { console.log(`getOriginalSourceData() + transformData() took ${(tDataAfter-tDataBefore).toFixed(0)}ms`) }

	const tCompileBefore = logPerformance ? performance.now() : 0
	const reportCompiled = await compile(report, inputData, api)
	const tCompileAfter = logPerformance ? performance.now() : 0
	if (logPerformance) { console.log(`compile() took ${(tCompileAfter-tCompileBefore).toFixed(0)}ms`) }
	
	// PDF
	if (report.target === 'pdf') {
		const tMakeHtmlBefore = logPerformance ? performance.now() : 0
		const html = makeHtml(reportCompiled)
		const tMakeHtmlAfter = logPerformance ? performance.now() : 0
		if (logPerformance) { console.log(`makeHtml() took ${(tMakeHtmlAfter-tMakeHtmlBefore).toFixed(0)}ms`) }

		return {
			'body': await makePdf(reportCompiled, html),
			'contentType': 'application/pdf',
			'filename': reportCompiled.properties.fileName || 'report.pdf',
		}
	}

	// JSON
	if (report.target === 'json') {
		const contents = JSON.stringify(inputData)
		const encoder = new TextEncoder()
		return {
			'body': encoder.encode(contents),
			'contentType': 'application/json',
			'filename': reportCompiled.properties.fileName || 'report.json',
		}
	}

	// CSV utf8
	if (report.target === 'csv-excel-utf-8') {
		if (!checkCsvFormat(inputData)) {
			throw new Error('data (transformed) is not CSV compatible')
		}
		const csv = makeCsv(inputData, 'UTF-8')
		return {
			'body': csv,
			'contentType': 'text/csv; charset=utf-8',
			'filename': reportCompiled.properties.fileName || 'report.csv',
		}
	}

	// CSV Win-1250 CP-1250
	if (report.target === 'csv-windows-1250') {
		if (!checkCsvFormat(inputData)) {
			throw new Error('data (transformed) is not CSV compatible')
		}
		const csv = makeCsv(inputData, 'CP1250')
		return {
			'body': csv,
			'contentType': 'text/csv; charset=windows-1250',
			'filename': reportCompiled.properties.fileName || 'report.csv',
		}
	}

	assertUnreachableTarget(report.target)
}
