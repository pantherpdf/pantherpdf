import { Handler } from '@netlify/functions'
import connectToDatabase from '../db'
import { sidFromEvent, userEmailFromSid } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
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

	const name = (event.queryStringParameters && event.queryStringParameters.name) || ''
	if (name.length === 0) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}

	const db = await connectToDatabase()
	const obj = await db.files.deleteOne({email, name})
	if (obj.deletedCount != 1) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}
	
	return {
		statusCode: 200,
		body: JSON.stringify({}),
	}
};

export { handler };
