import React from 'react'
import App from '../Layout'
import type { RouteComponentProps } from 'react-router-dom'

export default function NotFound(props: RouteComponentProps) {
	return <App {...props}><main className='container'>
		<h1>Error 404. Page not found.</h1>
	</main></App>
}
