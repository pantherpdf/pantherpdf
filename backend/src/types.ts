export interface ErrorResponse {
	msg: string,
}

export type ContactSubscribeRequest = { email: string, captchaToken: string }
export function ContactSubscribeRequestTypeGuard(r: any): r is ContactSubscribeRequest {
	if (typeof r != 'object' || !r)
		return false
	if (Object.keys(r).length !== 2)
		return false
	if (!('email' in r) || typeof r.email != 'string')
		return false
	if (!('captchaToken' in r) || typeof r.captchaToken != 'string')
		return false
	return true
}
export type ContactSubscribeResponse = {} | ErrorResponse
