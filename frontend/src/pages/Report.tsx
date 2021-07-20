import App from '../Layout'
import { RouteComponentProps } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { IReport, ReportResponse } from '../../../backend/shared/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from '../context'
import Editor from '../editor/Editor'
import { TReport } from '../editor/types'
import { CounterData } from '../widgets/counter'
import { RepeatData } from '../widgets/repeat'
import { TextSimpleData } from '../widgets/textSimple'
import { sampleReport } from '../editor/sampleReport'

type ReportParams = { id: string }
interface ReportProps extends RouteComponentProps<ReportParams> {
}

export default function Report(props: ReportProps) {
	const [data, setData] = useState<IReport|string>('loading')
	const app = useContext(AppContext)

	// sample data
	const dt: CounterData = {type: 'counter', varName: 'counter1', children: [
		{type:'repeat', varName:'rp', formula:'["a","b","c"]', children:[
			{type:'textSimple', formula:'rp + counter1'} as TextSimpleData
		]} as RepeatData
	]}
	const [report, setReport] = useState<TReport>({...sampleReport, children: [dt]})
	async function setReport2(val: TReport): Promise<void> {
		setReport(val)
	}

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
		return <App {...props}><main className='container'>
			<FontAwesomeIcon icon={faSpinner} spin={true} style={{margin:'50px auto'}} /> 
		</main></App>
	}
	if (!data) {
		return <App {...props}><main className='container'><h1>Error. Report not found</h1></main></App>
	}
	return <App {...props}>
		<Editor
			report={report}
			setReport={setReport2}
			allReports={app.reports}
		/>
	</App>
}