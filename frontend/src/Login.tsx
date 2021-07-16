import './Login.css'
import { AppContext, IAppContextCB } from './context'
import { useContext, useState } from 'react'
import type { RouteComponentProps } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

interface LoginProps extends RouteComponentProps {
}

async function loginAnonymous(props: LoginProps, app: IAppContextCB) {
	let r, js
	try {
		r = await fetch('/.netlify/functions/loginAnonymous', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({}),
		})
		js = await r.json()
	}
	catch(e) {
		console.log(e)
		alert('Error.')
		return
	}
	if (!r.ok) {
		console.log(js)
		const msg: string = (js && typeof js.msg === 'string') ? js.msg : 'Unknown error'
		alert(`Error while creating anonymous user: ${msg}`)
		return
	}
	if (!(typeof js === 'object' && typeof js.sid === 'string')) {
		alert(`Bad response, missing id.`)
		return
	}
	const sid = js.sid as string
	await app.setSid(sid)
	props.history.replace('/dashboard')
}


function ButtonAnonymous(props: LoginProps) {
	const app = useContext(AppContext)
	const [loading, setLoading] = useState(false)
	async function cb() {
		setLoading(true)
		try {
			await loginAnonymous(props, app)
		}
		catch(e) {
			setLoading(false)
			throw e
		}
		// setLoading(false)  dont do that because component is already unmounted
	}
	return <button
		className='btn btn-outline-secondary'
		onClick={cb}
	>
		Anonymous
		{loading && <FontAwesomeIcon icon={faSpinner} spin={true} className='ms-2' />}
	</button>
}


export default function Login(props: LoginProps) {
	return <div className='form-signin'>
		<h1 className='h2'>Kelgrand Reports</h1>
		<h2 className='h1 mb-4'>Login</h2>
		<button className='btn btn-primary'>Github</button>
		<hr />
		<ButtonAnonymous {...props} />
	</div>
}