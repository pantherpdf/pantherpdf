import App from '../Layout'
import type { RouteComponentProps } from 'react-router-dom'

export default function Home(props: RouteComponentProps) {
	return <App {...props}><main className='container'>
		<h1>Kelgrand Reports</h1>
		<p>abc 123</p>
	</main></App>
}
