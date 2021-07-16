import { Handler } from '@netlify/functions'
import { ObjectID } from 'mongodb';
import { ReportRemoveRequestTypeGuard, ReportRemoveResponse } from '../../shared/types'
import connectToDatabase from '../db'
import { userEmailFromEvent } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}
	
	const email = await userEmailFromEvent(event)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}

	const rq = JSON.parse(event.body || '')
	if (!ReportRemoveRequestTypeGuard(rq)) {
		return { statusCode: 401, body: JSON.stringify({msg: 'Bad request body'}) }
	}
	const id = new ObjectID(rq.id)
	
	const db = await connectToDatabase()
	const result = await db.reports.deleteOne({_id: id})
	if (result.deletedCount !== 1) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Bad request body'}) }
	}
	db.logEvent(event, 'reportRemove', {email, reportId:rq.id})

	const rs: ReportRemoveResponse = {}
	return {
		statusCode: 200,
		body: JSON.stringify(rs),
	}
};

export { handler };
