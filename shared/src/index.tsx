import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Editor from './editor/Editor';
import { sampleReport } from './editor/sampleReport';
import { ApiEndpoints, TReport } from './types';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
	const [report, setReport] = useState<TReport>(sampleReport)

	const api: ApiEndpoints = {
		reportGet: (id) => { throw new Error('') },
		files: async () =>  { throw new Error('') },
		filesDelete: async (name) => { },
		filesUpload: async (file, data, cbProgress) => { },
		filesDownloadUrl: (name) => { throw new Error('') },
		fonts: async () => { return ['arial','times new roman'] },
		allReports: async () => { return [] },
	}

	return <Editor
		report={report}
		setReport={async (r) => setReport(r)}
		deleteReport={() => {}}
		api={api}
	/>
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);
