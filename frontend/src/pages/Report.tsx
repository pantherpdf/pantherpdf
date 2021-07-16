//import Edit from './edit'
import { RouteComponentProps } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { IReport, ReportResponse } from '../../../backend/shared/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from '../context'

type ReportParams = { id: string }
interface ReportProps extends RouteComponentProps<ReportParams> {
}

export default function Report(props: ReportProps) {
	const [data, setData] = useState<IReport|string>('loading')
	const app = useContext(AppContext)

	const id = props.match.params.id
	useEffect(() => {
		(async function() {
			const r = await fetch(`/.netlify/functions/report?id=${id}`, {headers: {Authorization: `Bearer sid:${app.sid}`}})
			const js = await r.json() as ReportResponse
			if (!r.ok || 'msg' in js) {
				const msg = 'msg' in js ? js.msg : 'unknown error'
				setData(msg)
			}
			else {
				setData(js.obj)
			}
		})()
	}, [id, app.sid])

	if (data === 'loading') {
		return <div>
			<FontAwesomeIcon icon={faSpinner} spin={true} style={{margin:'50px auto'}} /> 
		</div>
	}
	if (!data) {
		return <h1>Error. Report not found</h1>
	}
	return <div>
		<h1>Report {props.match.params.id}</h1>
	</div>
}