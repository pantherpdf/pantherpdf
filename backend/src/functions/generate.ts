import { Handler } from '@netlify/functions'
import { ObjectId } from 'mongodb';
import connectToDatabase from '../db'
import { sidFromEvent, userEmailFromEvent } from '../users'
import { ApiEndpoints, compile, FileUploadData, makeHtml, transformData } from 'reports-shared'
import { GenerateRequestTypeGuard, GenerateResponse, IReportGenerated } from '../types'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import crypto from 'crypto'
import fetch from 'node-fetch'
import vm from 'vm'


async function execCode(code: string): Promise<any> {
	const script = new vm.Script(code + ';;;;;{getData();}');
	const context2 = { setTimeout, console, fetch };
	const context = vm.createContext(context2)
	const data = await script.runInContext(context)
	return data
}


async function loadDataFromUrl(url: string): Promise<any> {
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
		const PUBLIC_URL = process.env.PUBLIC_URL || ''
		if (!url.startsWith(PUBLIC_URL+'/')) {
			throw new Error('Bad host')
		}
		const code = await r.text()
		return execCode(code)
	}
	if (ct == 'application/json') {
		return r.json()
	}
	throw new Error(`Invalid response. Content-Type: ${ct}`)
}


const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	// auth
	const sid = sidFromEvent(event)
	const email = await userEmailFromEvent(event)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}
	if (!sid) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Need to use sid'}) }
	}

	// uploaded data
	const rqData = JSON.parse(event.body || '')
	if (!GenerateRequestTypeGuard(rqData)) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Bad request'}) }
	}

	// report
	const reportId = (event.queryStringParameters && event.queryStringParameters.id) || ''
	if (reportId.length === 0) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}

	// get report
	const db = await connectToDatabase()
	const report2 = await db.reports.findOne({_id: new ObjectId(reportId), email})
	if (!report2) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}
	
	// change _id
	const report = {...report2, _id: report2._id?.toHexString() || ''}

	// api
	const PUBLIC_URL = process.env.PUBLIC_URL || ''
	const api: ApiEndpoints = {
		reportGet: (id: string) => { throw new Error('not implemented')},
		files: () => { throw new Error('not implemented')},
		filesDelete: (name: string) => { throw new Error('not implemented')},
		filesUpload: (file: File, data: FileUploadData, cbProgress: (prc: number) => void) => { throw new Error('not implemented')},
		filesDownloadUrl: (name: string) => {
			return `${PUBLIC_URL}/.netlify/functions/filesDownload?name=${encodeURIComponent(name)}&sid=${encodeURIComponent(sid)}`
		},
		fonts: () => { throw new Error('not implemented')},
		allReports: () => { throw new Error('not implemented')},
	}

	// prepare data
	let data = {}
	if ('data' in rqData) {
		data = rqData.data
	}
	else if (
		(rqData.dataUrl && rqData.dataUrl.length > 0) ||
		report.dataUrl.length > 0
	) {
		let url = (rqData.dataUrl && rqData.dataUrl.length > 0) ? rqData.dataUrl : report.dataUrl
		if (url.startsWith('local/')) {
			url = url.substring(6)
			url = api.filesDownloadUrl(url)
		}
		url = new URL(url, PUBLIC_URL).href
		try {
			data = await loadDataFromUrl(url)
		}
		catch(e) {
			return { statusCode: 400, body: JSON.stringify({msg: 'Error while preparing sourceData: '+String(e)}) }
		}
	}
	// transform
	try {
		data = await transformData(data, report)
	}
	catch(e) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Error while transforming data: '+String(e)}) }
	}

	// convert
	db.logEvent(event, 'generate', {email, reportId})
	let compiled
	try {
		compiled = await compile(report, data, api)
	}
	catch(e) {
		return { statusCode: 400, body: JSON.stringify({msg: String(e)}) }
	}
	const el1 = makeHtml(compiled)
	const el2 = React.createElement('div', {}, el1)
	const html = ReactDOMServer.renderToStaticMarkup(el2)

	// insert into db
	const time = new Date().toISOString().substring(0,19)+'Z'
	const accessKey = crypto.randomBytes(24).toString('hex');
	const obj: IReportGenerated = {
		email,
		time,
		html,
		reportId,
		accessKey,
	}
	await db.reportsGenerated.insertOne(obj)

	const res: GenerateResponse = {
		accessKey,
	}
	return { statusCode: 200, body: JSON.stringify(res) }
};

export { handler };
