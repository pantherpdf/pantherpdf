import { Handler } from "@netlify/functions";
import { TReportShort } from 'reports-shared'
import { UserDataResponse } from '../types'
import connectToDatabase from "../db";
import { userDataFromEvent } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'GET') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const user = await userDataFromEvent(event)
	if (user) {
		const db = await connectToDatabase()
		const projection: {[key in (keyof TReportShort)]: 1} = {
			_id: 1,
			name: 1,
			target: 1,
		}
		const reportsTmp = (await db.reports.find({email: user.email}).project(projection).toArray()) as any
		const reports = reportsTmp.map((x: any) => { x._id = x._id.toHexString(); return x; }) as TReportShort[]

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