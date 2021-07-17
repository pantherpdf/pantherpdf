import { useContext } from 'react'
import { AppContext } from '../context'
import { Link, RouteComponentProps } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

interface ReportsProps extends RouteComponentProps { }

export default function Reports(props: ReportsProps) {
	const app = useContext(AppContext)
	
	async function reportAdd() {
		const name = prompt('Report name: ')
		if (!name)
			return
		const id = await app.reportNew(name)
		props.history.push(`/reports/${id}`)
	}

	return <main className='container'>
		<h1>Reports</h1>
		<ul>
			{app.reports.map(r => <li key={r._id}>
				<Link to={`/reports/${r._id}`}>{r.name}</Link>
			</li>)}
		</ul>
		{app.reports.length === 0 && <p>No reports</p>}
		<button className='btn btn-primary' onClick={reportAdd}>
			<FontAwesomeIcon icon={faPlus} className='me-2' />
			New
		</button>
	</main>
}
