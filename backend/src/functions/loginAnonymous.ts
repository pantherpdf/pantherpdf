import { Handler } from "@netlify/functions"
import { createUser, createSession } from '../users'
import { LoginAnonymousRequestTypeGuard, IUser, LoginAnonymousResponse } from '../../shared/types'
import crypto from 'crypto'
import connectToDatabase from '../db'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const rq = JSON.parse(event.body || '');
	if (!LoginAnonymousRequestTypeGuard(rq)) {
		return { statusCode: 405, body: JSON.stringify({msg: 'Bad request'}) }
	}

	const db = await connectToDatabase()
	let sid
	let anonymousId
	if (rq.anonymousId) {
		const email = `anonymous-${rq.anonymousId}`
		const user = await db.users.findOne({email})
		if (user) {
			sid = await createSession(user.email)
			anonymousId = rq.anonymousId
		}
	}
	if (!sid || !anonymousId) {
		anonymousId = crypto.randomBytes(12).toString('hex');
		const user: IUser = {
			name: `Anonymous ${anonymousId}`,
			email: `anonymous-${anonymousId}`,
			anonymousId,
		}
		await createUser(user)
		sid = await createSession(user.email)
	}

	const resp: LoginAnonymousResponse = { sid, anonymousId }
	return {
		statusCode: 200,
		body: JSON.stringify(resp),
	};
};

export { handler };