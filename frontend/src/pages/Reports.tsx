import App from '../Layout'
import { useContext } from 'react'
import { AppContext } from '../context'
import { Link, RouteComponentProps } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile, faFileCsv, faFilePdf, faPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { TargetOption } from 'reports-shared'

interface ReportsProps extends RouteComponentProps { }

function getIconForTarget(t: TargetOption): IconDefinition {
	if (t === 'pdf')
		return faFilePdf
	if (t.startsWith('csv-'))
		return faFileCsv
	return faFile
}

export default function Reports(props: ReportsProps) {
	const app = useContext(AppContext)
	
	async function reportAdd() {
		const dt = new Date().toISOString()
		const name = `Report ${dt.substring(0, 16).replace('T', ' ')}`
		const id = await app.reportNew(name)
		props.history.push(`/reports/${id}`)
	}

	return <App {...props}><main className='container'>
		<h1>Reports</h1>
		<table className="table">
			<thead className="table-light">
				<tr>
					<th>
						Name
					</th>
				</tr>
			</thead>
			<tbody>
				{app.reports.map(r => <tr key={r._id}>
					<td>
						<Link to={`/reports/${r._id}`}>
							<FontAwesomeIcon icon={getIconForTarget(r.target)} className='me-2' />
							{r.name}
						</Link>
					</td>
				</tr>)}
			</tbody>
		</table>
		{app.reports.length === 0 && <p className='text-muted'>
			You dont have any reports yet. Create one by clicking <i>New</i>
		</p>}
		<button className='btn btn-primary' onClick={reportAdd}>
			<FontAwesomeIcon icon={faPlus} className='me-2' />
			New
		</button>
	</main></App>
}
