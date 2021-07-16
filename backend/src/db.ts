import { MongoClient, Db, Collection, ObjectID } from "mongodb"
import { IUser, IKey, ISession, IReport, IEvent } from '../shared/types'
import { sidFromEvent, userEmailFromSid, keyFromEvent, userEmailFromKey } from './users'
import type { Event } from "@netlify/functions/src/function/event"

// connect to MongoDB and cache

type With_id<T> = T & {_id?: ObjectID}

interface ICache {
	db: Db,
	logEvent: (rqEvent: Event|null, type: string, otherData?: object) => Promise<void>,
	users: Collection<With_id<IUser>>,
	sessions: Collection<With_id<ISession>>,
	reports: Collection<With_id<IReport>>,
	events: Collection<With_id<IEvent>>,
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
			logEvent: async function(rqEvent: Event|null, type: string, otherData?: object) {
				const event: IEvent = {
					...otherData,
					type,
					time: new Date().toISOString(),
				}
				if (!('sid' in event) && rqEvent) {
					const sid = await sidFromEvent(rqEvent)
					if (sid)
						event.sid = sid
				}
				if (!('key' in event) && rqEvent) {
					const key = await keyFromEvent(rqEvent)
					if (key)
						event.key = key
				}
				if (!('email' in event) && event.sid) {
					const email = await userEmailFromSid(event.sid)
					if (email)
						event.email = email
				}
				if (!('email' in event) && event.key) {
					const email = await userEmailFromKey(event.key)
					if (email)
						event.email = email
				}
				if (!('ip' in event) && rqEvent) {
					if ('x-forwarded-for' in rqEvent.headers)
						event.ip = rqEvent.headers['x-forwarded-for']
				}
				if (!('userAgent' in event) && rqEvent) {
					if ('user-agent' in rqEvent.headers)
						event.userAgent = rqEvent.headers['user-agent']
				}
				await this.events.insertOne(event)
			},
			users: db.collection<With_id<IUser>>('users'),
			sessions: db.collection<With_id<ISession>>('sessions'),
			reports: db.collection<With_id<IReport>>('reports'),
			events: db.collection<With_id<IEvent>>('events'),
		}
	}
	return cache;
}
