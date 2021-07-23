import { Handler } from '@netlify/functions'
import { FilesResponse, TFileShort } from 'reports-shared'
import connectToDatabase from '../db'
import { userEmailFromEvent } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'GET') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}
	
	const email = await userEmailFromEvent(event)
	if (!email) {
		return { statusCode: 403, body: JSON.stringify({msg: 'Not allowed'}) }
	}

	const db = await connectToDatabase()
	const files1 = await db.files.find({email}).project({_id:1, name:1, mimeType:1, uploadTime:1, modifiedTime:1, size:1}).toArray()
	const files2: TFileShort[] = files1.map(f => {
		const file: TFileShort = {
			name: f.name,
			mimeType: f.mimeType,
			uploadTime: f.uploadTime,
			modifiedTime: f.modifiedTime,
			size: f.size,
		}
		return file
	})

	const obj: FilesResponse = {
		files: files2
	}
	return {
		statusCode: 200,
		body: JSON.stringify(obj),
	}
};

export { handler };
