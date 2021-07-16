import { MongoClient, Db } from "mongodb"

// connect to MongoDB and cache
let cachedDb: Db;
export default async function connectToDatabase() {
	if (cachedDb) {
		return cachedDb;
	}
	const MONGODB_URI = `mongodb+srv://${encodeURIComponent(process.env.MONGODB_USER||'')}:${encodeURIComponent(process.env.MONGODB_PASSWORD||'')}@${process.env.MONGODB_URL||''}/${encodeURIComponent(process.env.MONGODB_DB||'')}?retryWrites=true&w=majority`;
	const client = await MongoClient.connect(MONGODB_URI);
	const db = client.db(process.env.MONGODB_DB);
	cachedDb = db;
	return db;
}