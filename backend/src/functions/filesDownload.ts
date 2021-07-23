import { Handler } from '@netlify/functions'
import connectToDatabase from '../db'
import { sidFromParam, userEmailFromSid } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'GET') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}
	
	const sid = sidFromParam(event)
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
	const obj = await db.files.findOne({email, name})
	if (!obj) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}
	
	return {
		statusCode: 200,
		headers: {
			'Content-Type': obj.mimeType,
			'Content-Disposition': `attachment; filename=${name}`,
		},
		body: obj.data.toString('base64'),
		isBase64Encoded: true,
	}
};

export { handler };
