import { Handler } from "@netlify/functions";
import { ISession } from "../../../types";
import connectToDatabase from "../db";
import { sidFromEvent } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}
	
	const sid = await sidFromEvent(event)
	if (sid) {
		const db = await connectToDatabase()
		await db.collection<ISession>('sessions').deleteOne({sid})
	}
	return {
		statusCode: 200,
		body: JSON.stringify({}),
	}
};

export { handler };