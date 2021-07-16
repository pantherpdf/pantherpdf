import { useState } from 'react'
import { AppContext } from './context'
import { useContext } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faSignOutAlt, faPlus, faKey, faCog, IconDefinition, faFileAlt } from '@fortawesome/free-solid-svg-icons'

interface IProps extends RouteComponentProps<any> {
	children: React.ReactChild | React.ReactChild[],
}

export default function App(props: IProps) {
	const [showMenu, setShowMenu] = useState(false)
	const app = useContext(AppContext)

	if (!app.user)
		return <div>Missing user</div>

	const menu: [string,string,IconDefinition][] = [
		['/dashboard', 'Dashboard', faHome],
		['/keys', 'Keys', faKey],
		['/settings', 'Settings', faCog],
	]

	async function newReport() {
		const name = prompt('Report name: ')
		if (!name)
			return
		const id = await app.reportNew(name)
		props.history.push(`/reports/${id}`)
	}

	return <>
		<nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow-sm">
			<span className="navbar-brand col-md-3 col-lg-2 me-0 px-3">Kelgrand Reports</span>
			<button className="navbar-toggler position-absolute d-md-none collapsed" type="button" data-toggle="collapse" data-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation" onClick={() => setShowMenu(!showMenu)}>
				<span className="navbar-toggler-icon"></span>
			</button>

			<ul className="navbar-nav px-3">
				<li className="nav-item text-nowrap">
					&nbsp; {/*<a className="nav-link" href="#">Sign out</a>*/}
				</li>
			</ul>
		</nav>
	

		<div className="container-fluid">
			<div className="row">
				<nav id="sidebarMenu" className={'col-md-3 col-lg-2 d-md-block bg-light sidebar collapse '+(showMenu?'show':'')}>
					<div className="sidebar-sticky pt-3">
						<h6 className="sidebar-heading mt-2 mb-1 text-muted" style={{paddingLeft:'1rem'}}>
							{app.user.name}
						</h6>
						<ul className="nav flex-column">
							
							{menu.map(arr => <li className="nav-item" key={arr[0]}>
								<Link className={'nav-link '+(props.history.location.pathname===arr[0]?'active':'')} to={arr[0]}>
									<FontAwesomeIcon icon={arr[2]} fixedWidth className='me-2 text-muted' />
									{arr[1]}
								</Link>
							</li>)}

							<li className="nav-item">
								<button className={'btn btn-link nav-link'} onClick={async () => { await app.logout(); props.history.push('/login')}}>
									<FontAwesomeIcon icon={faSignOutAlt} fixedWidth className='me-2 text-muted' />
									Log out
								</button>
							</li>
						</ul>
						<h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
							<span>Reports</span>
							<button className="btn btn-light btn-sm text-muted" onClick={newReport}>
								<FontAwesomeIcon icon={faPlus} />
							</button>
						</h6>
						<ul className="nav flex-column mb-2">
							{app.reports.map(r => <li className="nav-item" key={r._id}>
								<Link className={'nav-link '+(props.match.path==='/reports/:id'&&props.match.params.id===r._id ? 'active' : '')} to={`/reports/${r._id}`}>
									<FontAwesomeIcon icon={faFileAlt} className='me-2' />
									{r.name}
								</Link>
							</li>)}
						</ul>
					</div>
				</nav>
				<main role="main" className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
					{props.children}
				</main>
			</div>
		</div>
	</>
}
