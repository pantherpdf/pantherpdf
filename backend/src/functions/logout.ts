import { Handler } from "@netlify/functions";
import connectToDatabase from "../db";
import { sidFromEvent } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}
	
	const sid = await sidFromEvent(event)
	if (sid) {
		const db = await connectToDatabase()
		db.logEvent(event, 'logout')
		await db.sessions.deleteOne({sid})
		return {
			statusCode: 200,
			body: JSON.stringify({}),
		}
	}
	return {
		statusCode: 400,
		body: JSON.stringify({msg: 'sid not found'}),
	}
};

export { handler };