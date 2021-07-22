import App from '../Layout'
import type { RouteComponentProps } from 'react-router-dom'
import SettingsKeys from './SettingsKeys'


export default function Settings(props: RouteComponentProps) {
	return <App {...props}><main className='container'>
		<h1>Settings</h1>
		<SettingsKeys />
	</main></App>
}
