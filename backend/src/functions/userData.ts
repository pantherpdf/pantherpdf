import { Handler } from "@netlify/functions";
import { IReport, IReportShort } from "../../shared/types";
import connectToDatabase from "../db";
import { userDataFromEvent } from '../users'

const handler: Handler = async (event, context) => {
	if (event.httpMethod != 'GET') {
		return { statusCode: 405, body: JSON.stringify({msg: 'Method not allowed'}) }
	}

	const user = await userDataFromEvent(event)
	if (user) {
		const db = await connectToDatabase()
		const reports = await db.collection<IReport>('reports').find({email: user.email}).project({name:1}).toArray() as any as IReportShort[]

		const dt = {
			user,
			reports,
		}
		return {
			statusCode: 200,
			body: JSON.stringify(dt),
		}
	}
	return {
		statusCode: 401,
		body: JSON.stringify({msg: 'Missing header Authentication or session has expired'}),
	}
};

export { handler };