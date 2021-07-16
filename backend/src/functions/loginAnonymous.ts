import { Handler } from "@netlify/functions"
import { createUser, createSession } from '../users'
import type { IUser } from '../../shared/types'
import crypto from 'crypto'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const anId = crypto.randomBytes(12).toString('hex');
	const user: IUser = {
		name: `Anonymous ${anId}`,
		email: `anonymous-${anId}`,
	}
	
	await createUser(user)
	const sid = await createSession(user.email)

	return {
		statusCode: 200,
		body: JSON.stringify({ sid }),
	};
};

export { handler };