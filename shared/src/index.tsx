import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Editor from './editor/Editor';
import { sampleReport } from './editor/sampleReport';
import { ApiEndpoints, TReport } from './types';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
	const [report, setReport] = useState<TReport>(sampleReport)
	const orgiData = {
		abc: 123,
	}

	const api: ApiEndpoints = {
		reportGet: (id) => { throw new Error('') },
		files: async () =>  { throw new Error('') },
		filesDelete: async (name) => { },
		filesUpload: async (file, data, cbProgress) => { },
		filesDownloadUrl: (name) => { throw new Error('') },
		fonts: async () => { return ['arial','times new roman'] },
	}

	return <Editor
		report={report}
		setReport={async (r) => setReport(r)}
		deleteReport={() => {}}
		allReports={[]}
		getOriginalSourceData={() => orgiData}
		api={api}
	/>
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);
