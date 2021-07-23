import React from 'react'
import App from '../Layout'
import type { RouteComponentProps } from 'react-router-dom'
import SettingsKeys from './SettingsKeys'
import FileDialog from '../FileDialog'


export default function Settings(props: RouteComponentProps) {
	return <App {...props}><main className='container'>
		<h1>Settings</h1>
		<SettingsKeys />
		<div style={{height:'50px'}} />
		<FileDialog
			mode='link'
		/>
	</main></App>
}
