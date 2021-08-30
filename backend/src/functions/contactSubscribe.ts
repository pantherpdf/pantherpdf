import { Handler } from '@netlify/functions'
import { ContactSubscribeRequestTypeGuard } from '../types'
import validateCaptcha from '../validateCaptcha'
import fetch from 'node-fetch'


const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const SENDGRID_API = process.env.SENDGRID_API || ''
	const HOST = new URL(process.env.PUBLIC_URL || '').hostname
	const data = JSON.parse(event.body || '')
	if (!ContactSubscribeRequestTypeGuard(data)) {
		return { statusCode: 405, body: JSON.stringify({msg: 'Bad data'}) }
	}
	
	if (data.email.length === 0 || data.email.length > 200) {
		return { statusCode: 405, body: JSON.stringify({msg: 'Bad email.'}) }
	}
	let score
	try {
		score = await validateCaptcha('subscribe', data.captchaToken, HOST)
	}
	catch(e) {
		return { statusCode: 500, body: JSON.stringify({msg: String(e)}) }
	}
	if (score < 0.3) {
		return { statusCode: 400, body: JSON.stringify({msg: 'You do not look like a human according to Captcha.'}) }
	}

	const rq = {
		personalizations: [{
			to: [{email: 'ignacb@gmail.com', name: 'Ignac Banič'}],
			subject: 'Subscribe'
		}],
		content: [
			{type: 'text/plain', value: `Subscribe: ${data.email}`}
		],
		from: {email: data.email},
		reply_to: {email: data.email}
	}

	// send
	try {
		const r = await fetch(`https://api.sendgrid.com/v3/mail/send`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${SENDGRID_API}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(rq),
		})
		if (!r.ok) {
			const msg = 'Error while sending email'
			console.log(msg, await r.text())
			return { statusCode: 500, body: JSON.stringify({msg}) }
		}
		return { statusCode: 200, body: '{}' }
	}
	catch(e) {
		console.log(e)
		return { statusCode: 500, body: JSON.stringify({msg: 'Network error while sending'}) }
	}
};

export { handler };
