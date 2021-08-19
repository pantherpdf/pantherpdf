import React, { useContext, useState, useEffect } from 'react'
import App from '../Layout'
import { AppContext } from '../context'
import type { RouteComponentProps } from 'react-router-dom'
import SettingsKeys from './SettingsKeys'
import type { FileDialog } from 'reports-shared'
import getApi from '../api'


export default function Settings(props: RouteComponentProps) {
	const app = useContext(AppContext)
	const api = getApi(app)
	const [FileDialog2, setFileDialog2] = useState<typeof FileDialog | undefined>(undefined)
	useEffect(() => {
		import('reports-shared').then(x => setFileDialog2(x.FileDialog))
	}, [])

	return <App {...props}><main className='container'>
		<h1>Settings</h1>
		<SettingsKeys />
		<div style={{height:'50px'}} />
		<h2>Settings</h2>
		{FileDialog2 ? <FileDialog2
			mode='link'
			api={api}
		/> : <div>Loading ...</div>}
	</main></App>
}
