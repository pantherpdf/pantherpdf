import { Handler } from '@netlify/functions'
import { ReportNewRequestTypeGuard, ReportNewResponse, TReportWithoutId } from '../../shared/types'
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
	const time = new Date().toISOString()
	const target = 'pdf'
	const obj: TReportWithoutId = {
		name,
		email,
		time,
		target,
		children: [],
		properties: {},
	}
	const result = await db.reports.insertOne(obj)
	const _id = result.insertedId.toHexString()

	db.logEvent(event, 'reportAdd', { email, reportId: _id })

	const resp: ReportNewResponse = { _id, name, target }
	return {
		statusCode: 200,
		body: JSON.stringify(resp),
	}
};

export { handler };
