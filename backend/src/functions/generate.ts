import { Handler } from '@netlify/functions'
import { ObjectId } from 'mongodb';
import connectToDatabase from '../db'
import { userEmailFromEvent } from '../users'
import { compile, IReportGenerated, makeHtml } from 'reports-shared'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import crypto from 'crypto'


const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	// auth
	const email = await userEmailFromEvent(event)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}

	// uploaded data
	const data = JSON.parse(event.body || '')

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

	// convert
	db.logEvent(event, 'generate', {email, reportId})
	const compiled = await compile(report, data)
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

	const res = {
		html,
		accessKey,
	}
	return { statusCode: 200, body: JSON.stringify(res) }
};

export { handler };
