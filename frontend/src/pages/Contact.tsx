import App from '../Layout'
import { RouteComponentProps } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ContactSendMessageRequest, ErrorResponse } from '../../../backend/src/types';


const siteKey = '6LcoIgUcAAAAABZEpxNOpXZw1J0tr2nmmAewH09t'
declare var grecaptcha: any;
async function execGrecaptcha(siteKey: string, action: string) {
	const prms = new Promise<void>((resolve) => {
		grecaptcha.ready(resolve)
	})
	await prms
	return grecaptcha.execute(siteKey, {action})
}

function loadScript(url: string) {
	// find if already exists
	const scripts = document.getElementsByTagName("script")
	for (let i=0; i<scripts.length; ++i) {
		if (scripts[i].getAttribute('src') === url) {
			return
		}
	}
	const script = document.createElement('script')
	script.src = url
	document.head.appendChild(script)
}

export default function Contact(props: RouteComponentProps) {
	const [email, setEmail] = useState<string>('')
	const [message, setMessage] = useState<string>('')
	const [error, setError] = useState<string>('')
	const [ok, setOk] = useState<boolean>(false)

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		const token = await execGrecaptcha(siteKey, 'contactSendMessage')
		
		const rq: ContactSendMessageRequest = { email, message, captchaToken: token }
		const r = await fetch(`/.netlify/functions/contactSendMessage`, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(rq)})
		if (r.ok) {
			setOk(true)
			setError('')
		}
		else {
			const js = await r.json() as ErrorResponse
			setError(js.msg)
		}
	}

	// load captcha
	useEffect(() => {
		const url = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
		loadScript(url)
	})

	return <App {...props}>
	<main className='container' style={{maxWidth:'500px'}}>
		
		<div className="pricing-header p-3 pb-md-4 mx-auto text-center">
			<h1 className="display-4 fw-normal">
				Contact
			</h1>
			<p className="fs-5 text-muted">
				Do you have a question regarding our products and services? Send us a message.
			</p>
		</div>

		{ok ? <div className="alert alert-success" role="alert">
			Succesfully sent.
		</div> : <form onSubmit={onSubmit}>
			{error.length > 0 && <div className="alert alert-danger" role="alert">
				{error}
			</div>}

			<div className="mb-3">
				<label htmlFor="contact-email" className="form-label">
					Email address
				</label>
				<input type="email" className="form-control" id="contact-email" autoComplete='email' value={email} onChange={e => setEmail(e.currentTarget.value)} />
			</div>

			<div className="mb-3">
				<label htmlFor="contact-message" className="form-label">
					Message
				</label>
				<textarea className="form-control" id="contact-message" rows={3} value={message} onChange={e => setMessage(e.currentTarget.value)} />
			</div>

			<button type='submit' className='btn btn-lg btn-primary'>
				Submit
			</button>
		</form>}

		<div className='text-center'>
			<div className='text-muted mt-5 mb-3'>
				or
			</div>
			send email: <a href='mailto:info@kelgrand.com'>info@kelgrand.com</a>
		</div>

	</main>
</App>
}
