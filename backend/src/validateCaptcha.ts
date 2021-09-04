import fetch from 'node-fetch'

export default async function validateCaptcha(action: string, token: string, host?: string): Promise<number> {
	const url = 'https://www.google.com/recaptcha/api/siteverify?secret='+process.env.CAPTCHA_PRIVATE+'&response='+token
	let r, js3
	try {
		r = await fetch(url, {
			method:'POST',
		})
		js3 = await r.json()
	}
	catch(e) {
		console.log(e)
		throw new Error('Unknown error while checking captcha 1')
	}
	if (!r.ok || typeof js3 !== 'object' || !js3) {
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
