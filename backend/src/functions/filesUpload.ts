import { Handler } from '@netlify/functions'
import { FileUploadDataTypeGuard, TFile, FileUploadResponse } from '../../shared/types'
import connectToDatabase from '../db'
import { userEmailFromEvent } from '../users'


const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'POST') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	// auth
	const email = await userEmailFromEvent(event)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}

	// parse header
	const dt1 = event.headers['x-data'] || ''
	const dt2 = JSON.parse(dt1)
	if (!FileUploadDataTypeGuard(dt2)) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Bad header: x-data'}) }
	}

	const name = dt2.name
	const body = Buffer.from(event.body||'', event.isBase64Encoded ? 'base64' : 'utf-8')
	const uploadTime = new Date().toISOString().substring(0,19)+'Z'
	const modifiedTime = dt2.modifiedTime < uploadTime ? dt2.modifiedTime : uploadTime

	// file size
	if (body.length > 5000000) {
		return { statusCode: 413, body: JSON.stringify({msg: 'File too big'}) }
	}

	// verify name
	if (name.trim() !== name || name.length == 0 || name.length > 50 || name[0] === '.') {
		return { statusCode: 400, body: JSON.stringify({msg: 'Invalid name'}) }
	}

	// mime
	const mimeType = dt2.mimeType
	const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp', 'image/avif', 'text/plain', 'text/css', 'text/html']
	// others: 'text/javascript'
	if (allowed.indexOf(mimeType) == -1) {
		return { statusCode: 400, body: JSON.stringify({msg: 'File type is not allowed'}) }
	}

	const db = await connectToDatabase()

	// check if name already exists
	const exist_result = await db.files.findOne({email, name})
	if (exist_result) {
		await db.files.deleteOne({_id: exist_result._id})
	}

	// limit number of files by user
	const num_files = await db.files.count({email})
	if (num_files >= 50) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Limit of 50 files is reached'}) }
	}
	if (email.startsWith('anonymous-') && num_files >= 3) {
		return { statusCode: 400, body: JSON.stringify({msg: 'Limit of 3 files is reached'}) }
	}
	
	// insert
	const obj: TFile = {
		email,
		name,
		mimeType,
		uploadTime,
		modifiedTime,
		data: body,
		size: body.length,
	}
	await db.files.insertOne(obj)

	const obj2: FileUploadResponse = {
		file: {
			name,
			mimeType,
			uploadTime,
			modifiedTime,
			size: body.length,
		}
	}
	return { statusCode: 200, body: JSON.stringify(obj2) }
};

export { handler };
