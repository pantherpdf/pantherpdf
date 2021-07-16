import { Handler } from "@netlify/functions";
import { ObjectID } from "mongodb";
import { ReportResponse } from "../../shared/types";
import connectToDatabase from "../db";
import { sidFromEvent, userEmailFromSid } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'GET') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}
	
	const sid = await sidFromEvent(event)
	if (!sid) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}
	const email = await userEmailFromSid(sid)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}

	const id = (event.queryStringParameters && event.queryStringParameters.id) || ''

	const db = await connectToDatabase()
	const obj = await db.reports.findOne({_id: new ObjectID(id)})
	if (!obj || obj.email != email) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}
	
	const rs: ReportResponse = { obj }
	return {
		statusCode: 200,
		body: JSON.stringify(rs),
	}
};

export { handler };
