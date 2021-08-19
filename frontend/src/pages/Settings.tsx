import React, { useContext, Suspense } from 'react'
import App from '../Layout'
import { AppContext } from '../context'
import type { RouteComponentProps } from 'react-router-dom'
import SettingsKeys from './SettingsKeys'
import getApi from '../api'


const FileDialog = React.lazy(() => import('reports-shared').then(({FileDialog}) => ({default: FileDialog})));


export default function Settings(props: RouteComponentProps) {
	const app = useContext(AppContext)
	const api = getApi(app)

	return <App {...props}><main className='container'>
		<h1>Settings</h1>
		<SettingsKeys />
		<div style={{height:'50px'}} />
		<h2>Settings</h2>
		<Suspense fallback={<div>Loading...</div>}>
			<FileDialog
				mode='link'
				api={api}
			/>
		</Suspense>
	</main></App>
}
