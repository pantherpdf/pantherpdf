import { Handler } from '@netlify/functions'
import connectToDatabase from '../db'
import { userEmailFromEvent } from '../users'
import { GeneratePdfResponseBase } from '../types'
import fetch from 'node-fetch'


const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const pdfId = (event.queryStringParameters && event.queryStringParameters.pdfId) || ''
	if (pdfId.length === 0) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}

	// auth
	const email = await userEmailFromEvent(event)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}

	const WORKER_URL = process.env.WORKER_URL || ''


	// send to worker
	try {
		const r = await fetch(`${WORKER_URL}/apiv1/status/${encodeURIComponent(pdfId)}`, {
			method: 'GET',
		})
		if (r.status === 404) {
			return { statusCode: 400, body: JSON.stringify({msg: 'pdfId doesnt exist'}) }
		}
		const jsResponse = await r.json()
		if (!r.ok || 'msg' in jsResponse) {
			const msg = (typeof jsResponse === 'object' && 'msg' in jsResponse && typeof jsResponse.msg === 'string') ? jsResponse.msg : 'Unknown error'
			connectToDatabase().then(db => db.logEvent(event, 'generateStatusError', {email, pdfId, msg}))
			return { statusCode: 500, body: JSON.stringify({msg}) }
		}
		return { statusCode: 200, body: JSON.stringify(jsResponse as GeneratePdfResponseBase) }
	}
	catch(e) {
		console.log(e)
		const msg = String(e)
		connectToDatabase().then(db => db.logEvent(event, 'generateStatusError', {email, pdfId, msg}))
		return { statusCode: 500, body: JSON.stringify({msg: 'Network error while sending to worker'}) }
	}
};

export { handler };
