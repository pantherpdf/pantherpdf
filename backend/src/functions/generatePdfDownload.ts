import { Handler } from '@netlify/functions'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'GET') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const pdfId = (event.queryStringParameters && event.queryStringParameters.pdfId) || ''
	if (pdfId.length === 0) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Not allowed or doesnt exist'}) }
	}

	const WORKER_URL = process.env.WORKER_URL || ''

	return { statusCode: 301, headers: { Location: `${WORKER_URL}/apiv1/download/${encodeURIComponent(pdfId)}` }}
};

export { handler };
