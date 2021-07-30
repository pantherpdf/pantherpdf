import { Handler } from '@netlify/functions'
import { KeyUpdateRequestTypeGuard } from 'reports-shared'
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
	if (!KeyUpdateRequestTypeGuard(rq)) {
		return { statusCode: 401, body: JSON.stringify({msg: 'Bad request body'}) }
	}
	
	const db = await connectToDatabase()

	const numSameName = await db.keys.countDocuments({name: rq.nameNew})
	if (numSameName != 0) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Key with this name already exists'}) }
	}

	const keyObj = await db.keys.findOne({email, name:rq.nameOld})
	if (!keyObj) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Key doesnt exist'}) }
	}

	db.logEvent(event, 'keyUpdate', {email, modifiedKey:keyObj.key})
	const result = await db.keys.updateOne({_id: keyObj._id}, {$set: {name: rq.nameNew}})
	if (result.matchedCount != 1) {
		return { statusCode: 500, body: JSON.stringify({msg: 'Key doesnt exist'}) }
	}

	return {
		statusCode: 200,
		body: JSON.stringify({}),
	}
};

export { handler };
