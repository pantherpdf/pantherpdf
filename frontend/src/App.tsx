import { useContext } from 'react'
import { AppContext } from './context'
import { Link, RouteComponentProps } from 'react-router-dom'

interface AppProps extends RouteComponentProps<any> {
	children: React.ReactChild | React.ReactChild[],
}

export default function App(props: AppProps) {
	const app = useContext(AppContext)
	return <>
		<header className='border-bottom mb-3'>
			<div className='container'>
				<div className='d-flex py-2'>
					<ul className='nav flex-fill'>
						<li><Link to='/' className='nav-link px-3 link-secondary'>Kelgrand Reports</Link></li>
						<li><Link to='/reports' className='nav-link px-3 link-secondary'>Reports</Link></li>
					</ul>
					<ul className='nav'>
						{app.user ? <>
							<li><span className='nav-link px-3 link-secondary'><small>{app.user.name}</small></span></li>
							<li><Link to='/settings' className='nav-link px-3 link-secondary'>Settings</Link></li>
							<li><button className='btn nav-link px-3 link-secondary' onClick={async () => { await app.logout(); props.history.push('/login')}}>Logout</button></li>
						</> : <>
							<li><Link to='/login' className='btn btn-primary'>Login</Link></li>
						</>}
					</ul>
				</div>
			</div>
		</header>
		{props.children}
	</>
}
