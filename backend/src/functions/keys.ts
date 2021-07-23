import { Handler } from '@netlify/functions'
import { KeysResponse } from 'reports-shared'
import connectToDatabase from '../db'
import { userEmailFromEvent } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'GET') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}
	
	const email = await userEmailFromEvent(event)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}

	const db = await connectToDatabase()
	const arr = await db.keys.find({email}).toArray()
	const arr2: KeysResponse = arr.map(x => ({name: x.name, time: x.time}))
	return {
		statusCode: 200,
		body: JSON.stringify(arr2),
	}
};

export { handler };
