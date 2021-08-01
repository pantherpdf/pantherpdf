import { Handler } from "@netlify/functions";
import { ObjectID } from "mongodb";
import { ReportResponse } from '../types'
import connectToDatabase from "../db";
import { sidFromEvent, userEmailFromSid } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'GET') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}
	
	const sid = sidFromEvent(event)
	if (!sid) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}
	const email = await userEmailFromSid(sid)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}

	const id = (event.queryStringParameters && event.queryStringParameters.id) || ''
	if (id.length === 0) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}

	const db = await connectToDatabase()
	const obj = await db.reports.findOne({_id: new ObjectID(id)})
	if (!obj || obj.email != email) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}
	
	const rs: ReportResponse = { obj: obj as any }
	return {
		statusCode: 200,
		body: JSON.stringify(rs),
	}
};

export { handler };
