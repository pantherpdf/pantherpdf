import { Handler } from '@netlify/functions'
import { ObjectID } from 'mongodb';
import { ReportTypeGuard } from 'reports-shared'
import connectToDatabase from '../db'
import { userEmailFromEvent } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	// auth
	const email = await userEmailFromEvent(event)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}

	// parse
	const rq = JSON.parse(event.body || '')
	if (typeof rq !== 'object' || typeof rq._id !== 'string') {
		return { statusCode: 401, body: JSON.stringify({msg: 'Bad request body'}) }
	}
	const _id = new ObjectID(rq._id)
	if (!ReportTypeGuard(rq)) {
		return { statusCode: 401, body: JSON.stringify({msg: 'Bad request body'}) }
	}

	// get old
	const db = await connectToDatabase()
	const oldReport = await db.reports.countDocuments({_id, email})
	if (oldReport != 1) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Report not found'}) }
	}

	// update
	const result = await db.reports.replaceOne({_id}, {...rq, _id})
	if (result.matchedCount != 1) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not changed for unknown reason.'}) }
	}
	db.logEvent(event, 'reportUpdate', { email, reportId: _id })
	
	return { statusCode: 200, body: JSON.stringify({}) }
};

export { handler };
