import { Handler } from '@netlify/functions'
import fetch from 'node-fetch'
import { ContactSendMessageRequestTypeGuard } from '../types'
import AbortController from 'abort-controller'



async function validateCaptcha(action: string, token: string, host?: string): Promise<number> {
	const url = 'https://www.google.com/recaptcha/api/siteverify?secret='+process.env.CAPTCHA_PRIVATE+'&response='+token
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), 4000)
	let r, js3
	try {
		r = await fetch(url, {
			method:'POST',
			signal: controller.signal
		})
		js3 = await r.json()
	}
	catch(e) {
		console.log(e)
		throw new Error('Unknown error while checking captcha 1')
	}
	clearTimeout(timeoutId)
	if (!r.ok || typeof js3 !== 'object') {
		console.log(js3)
		throw new Error('Unknown error while checking captcha 2')
	}
	interface SiteVerifyResponse {
		success: boolean,
		score: number,
		action: string,
		challenge_ts: string,
		hostname: string,
		'error-codes': any[],
	}
	const js4 = js3 as SiteVerifyResponse
	if (!js4.success || js4.action !== action) {
		return 0
	}
	if (host && host.length > 0 && host != js4.hostname) {
		return 0
	}
	return js4.score
}


const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const SENDGRID_API = process.env.SENDGRID_API || ''
	const HOST = new URL(process.env.PUBLIC_URL || '').hostname
	const data = JSON.parse(event.body || '')
	if (!ContactSendMessageRequestTypeGuard(data)) {
		return { statusCode: 405, body: JSON.stringify({msg: 'Bad data'}) }
	}
	
	if (data.email.length === 0 || data.message.length === 0) {
		return { statusCode: 405, body: JSON.stringify({msg: 'Empty email and/or message.'}) }
	}
	if (data.email.length > 200 || data.message.length > 3000) {
		return { statusCode: 405, body: JSON.stringify({msg: 'Message is too long.'}) }
	}
	let score
	try {
		score = await validateCaptcha('contactSendMessage', data.captchaToken, HOST)
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
			subject: 'Message from website'
		}],
		content: [
			{type: 'text/plain', value: data.message}
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
