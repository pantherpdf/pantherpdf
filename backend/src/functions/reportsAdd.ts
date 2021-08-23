import { Handler } from '@netlify/functions'
import { ReportNewRequestTypeGuard, ReportNewResponse, TReportWithoutId } from '../types'
import connectToDatabase from '../db'
import { userEmailFromEvent } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const rq = JSON.parse(event.body || '')
	if (!ReportNewRequestTypeGuard(rq)) {
		return { statusCode: 401, body: JSON.stringify({msg: 'Bad request body'}) }
	}
	const name = rq.name
	
	const email = await userEmailFromEvent(event)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}

	const db = await connectToDatabase()

	// insert
	const time = new Date().toISOString().substring(0,19)+'Z'
	const target = 'pdf'
	const version = '1.0.0'
	const obj: TReportWithoutId = {
		name,
		email,
		time,
		target,
		version,
		children: [],
		transforms: [],
		properties: {},
		dataUrl: '',
	}
	const result = await db.reports.insertOne(obj)
	const _id = result.insertedId.toHexString()

	db.logEvent(event, 'reportAdd', { email, reportId: _id })

	const resp: ReportNewResponse = { _id, name, target, version }
	return {
		statusCode: 200,
		body: JSON.stringify(resp),
	}
};

export { handler };
