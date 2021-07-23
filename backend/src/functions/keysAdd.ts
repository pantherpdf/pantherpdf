import { Handler } from '@netlify/functions'
import { IKey, KeyAddResponse, KeyAddRequestTypeGuard } from 'reports-shared'
import connectToDatabase from '../db'
import { userEmailFromEvent } from '../users'
import crypto from 'crypto'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const rq = JSON.parse(event.body || '')
	if (!KeyAddRequestTypeGuard(rq)) {
		return { statusCode: 401, body: JSON.stringify({msg: 'Bad request body'}) }
	}
	const name = rq.name
	
	const email = await userEmailFromEvent(event)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}

	// generate
	const key = crypto.randomBytes(32).toString('hex')

	const db = await connectToDatabase()

	// check that it doesnt exist
	const num = await db.keys.count({email})
	if (num >= 50) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Too many keys'}) }
	}
	const numSameKey = await db.keys.count({key: key})
	if (numSameKey > 0) {
		return { statusCode: 500, body: JSON.stringify({msg: 'Same key already exists. Try again.'}) }
	}
	const numSameKeyUser = await db.keys.count({email, name})
	if (numSameKeyUser > 0) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Key with same name already exists. Try again.'}) }
	}

	// insert
	db.logEvent(event, 'keyAdd', {email, modifiedKey:key})
	const time = new Date().toISOString().substring(0,19)+'Z'
	const keyObj: IKey = { key, name, email, time }
	await db.keys.insertOne(keyObj)

	const resp: KeyAddResponse = { key, name, time }
	return {
		statusCode: 200,
		body: JSON.stringify(resp),
	}
};

export { handler };
