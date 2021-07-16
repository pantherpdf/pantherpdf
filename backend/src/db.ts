import { MongoClient, Db, Collection, ObjectID } from "mongodb"
import { IUser, IKey, ISession, IReport, IEvent } from '../shared/types'
import { sidFromEvent, userEmailFromSid } from './users'
import type { Event } from "@netlify/functions/src/function/event"

// connect to MongoDB and cache

type With_id<T> = T & {_id?: ObjectID}

interface ICache {
	db: Db,
	users: Collection<With_id<IUser>>,
	sessions: Collection<With_id<ISession>>,
	reports: Collection<With_id<IReport>>,
}
let cache: ICache | undefined

export default async function connectToDatabase() {
	if (!cache) {
		const MONGODB_URI = `mongodb+srv://${encodeURIComponent(process.env.MONGODB_USER||'')}:${encodeURIComponent(process.env.MONGODB_PASSWORD||'')}@${process.env.MONGODB_URL||''}/${encodeURIComponent(process.env.MONGODB_DB||'')}?retryWrites=true&w=majority`;
		const client = await MongoClient.connect(MONGODB_URI, {
			useUnifiedTopology: true,
			connectTimeoutMS: 3000,
			serverSelectionTimeoutMS: 3000,
		});
		const db = client.db(process.env.MONGODB_DB);
		cache = {
			db,
			users: db.collection<With_id<IUser>>('users'),
			sessions: db.collection<With_id<ISession>>('sessions'),
			reports: db.collection<With_id<IReport>>('reports'),
		}
	}
	return cache;
}
