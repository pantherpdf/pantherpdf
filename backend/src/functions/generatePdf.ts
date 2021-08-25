import { Handler } from '@netlify/functions'
import connectToDatabase from '../db'
import { userEmailFromEvent } from '../users'
import { GeneratePdfResponseBase } from '../types'
import fetch from 'node-fetch'
import crypto from 'crypto'


const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const accessKey = (event.queryStringParameters && event.queryStringParameters.key) || ''
	if (accessKey.length === 0) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}

	// auth
	const email = await userEmailFromEvent(event)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}

	const WORKER_URL = process.env.WORKER_URL || ''
	const WORKER_SECRET = process.env.WORKER_SECRET || ''
	const PUBLIC_URL = process.env.PUBLIC_URL || ''

	// log
	const db = await connectToDatabase()
	db.logEvent(event, 'generatePdf', {email, accessKey})
	
	// prepare options
	const rq = {
		url: `${PUBLIC_URL}/.netlify/functions/generateShow?key=${encodeURIComponent(accessKey)}&mode=print`,
	}
	// todo pageWidth, ...

	// sign
	const rqString = JSON.stringify(rq)
	const rqBinary = Buffer.from(rqString, 'utf-8')
	const signature = crypto.createHmac('sha256', WORKER_SECRET)
	.update(rqBinary)
	.digest('hex')
	.toLowerCase()

	// send to worker
	try {
		const r = await fetch(`${WORKER_URL}/apiv1/convert`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-signature': signature,
			},
			body: rqString,
		})
		const jsResponse = await r.json()
		if (!r.ok || 'msg' in jsResponse) {
			const msg = (typeof jsResponse === 'object' && 'msg' in jsResponse && typeof jsResponse.msg === 'string') ? jsResponse.msg : 'Unknown error'
			db.logEvent(event, 'generatePdfError', {email, accessKey, msg})
			return { statusCode: 500, body: JSON.stringify({msg}) }
		}
		return { statusCode: 200, body: JSON.stringify(jsResponse as GeneratePdfResponseBase) }
	}
	catch(e) {
		console.log(e)
		const msg = String(e)
		db.logEvent(event, 'generatePdfError', {email, accessKey, msg})
		return { statusCode: 500, body: JSON.stringify({msg: 'Network error while sending to worker'}) }
	}
};

export { handler };
