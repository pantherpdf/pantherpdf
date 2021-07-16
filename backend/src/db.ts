import { MongoClient, Db, Collection } from "mongodb"
import { IUser, IKey, ISession, IReport, IEvent } from '../shared/types'
import { sidFromEvent, userEmailFromSid } from './users'
import type { Event } from "@netlify/functions/src/function/event"

// connect to MongoDB and cache

interface ICache {
	db: Db,
	users: Collection<IUser>,
	sessions: Collection<ISession>,
	reports: Collection<IReport>,
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
			users: db.collection<IUser>('users'),
			sessions: db.collection<ISession>('sessions'),
			reports: db.collection<IReport>('reports'),
		}
	}
	return cache;
}
