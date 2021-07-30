import React, { useContext } from 'react'
import App from '../Layout'
import { AppContext } from '../context'
import type { RouteComponentProps } from 'react-router-dom'
import SettingsKeys from './SettingsKeys'
import { FileDialog } from 'reports-shared'
import getApi from '../api'


export default function Settings(props: RouteComponentProps) {
	const app = useContext(AppContext)
	const api = getApi(app)

	return <App {...props}><main className='container'>
		<h1>Settings</h1>
		<SettingsKeys />
		<div style={{height:'50px'}} />
		<h2>Settings</h2>
		<FileDialog
			mode='link'
			api={api}
		/>
	</main></App>
}
