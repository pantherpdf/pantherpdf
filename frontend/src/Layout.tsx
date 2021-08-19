import { useContext } from 'react'
import { AppContext } from './context'
import { Link, RouteComponentProps } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

interface AppProps extends RouteComponentProps<any> {
	children: React.ReactNode,
}

export default function App(props: AppProps) {
	const app = useContext(AppContext)
	return <>
		<header className='border-bottom mb-3 fixed-top bg-white' style={{fontSize:'1.1rem', zIndex:300}}>
			<div className='container'>
				<div className='d-flex py-2'>
					<ul className='nav flex-fill'>
						<li><Link to='/' className='nav-link px-3 link-secondary'>Kelgrand Reports</Link></li>
						<li><Link to='/pricing' className='nav-link px-3 link-secondary'>Pricing</Link></li>
						<li><Link to='/contact' className='nav-link px-3 link-secondary'>Contact</Link></li>
					</ul>
					<ul className='nav'>
						{app.user ? <>
							<li><Link to='/reports' className='nav-link px-3 link-secondary'>My Reports</Link></li>
							<li><Link to='/settings' className='nav-link px-3 link-secondary'><FontAwesomeIcon icon={faUser} className='me-2' />{app.user.name}</Link></li>
							<li><button className='btn nav-link px-3 link-secondary' onClick={async () => { await app.logout(); props.history.push('/login')}}>Logout</button></li>
						</> : <>
							<li><Link to='/login' className='btn btn-primary'>Login</Link></li>
						</>}
					</ul>
				</div>
			</div>
		</header>
		<div style={{height:'60px'}} />
		{props.children}
	</>
}
