import { Handler } from '@netlify/functions'
import { KeyRemoveRequestTypeGuard } from '../../shared/types'
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
	if (!KeyRemoveRequestTypeGuard(rq)) {
		return { statusCode: 401, body: JSON.stringify({msg: 'Bad request body'}) }
	}
	const name = rq.name
	
	const db = await connectToDatabase()
	const keyObj = await db.keys.findOne({email, name})
	if (!keyObj) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Key doesnt exist'}) }
	}

	db.logEvent(event, 'keyRemove', {email, modifiedKey:keyObj.key})
	await db.keys.deleteOne({_id: keyObj._id})

	return {
		statusCode: 200,
		body: JSON.stringify({}),
	}
};

export { handler };
