import { Handler } from "@netlify/functions";
import { TReportShort, UserDataResponse } from 'reports-shared'
import connectToDatabase from "../db";
import { userDataFromEvent } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'GET') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const user = await userDataFromEvent(event)
	if (user) {
		const db = await connectToDatabase()
		const reports = await db.reports.find({email: user.email}).project({name:1}).toArray() as any as TReportShort[]

		delete (user as any)._id
		const dt: UserDataResponse = {
			user,
			reports,
		}
		db.logEvent(event, 'userData')
		return {
			statusCode: 200,
			body: JSON.stringify(dt),
		}
	}
	return {
		statusCode: 401,
		body: JSON.stringify({msg: 'Missing header Authentication or session has expired'}),
	}
};

export { handler };