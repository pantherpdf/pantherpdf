import connectToDatabase from './db'
import crypto from 'crypto'
import type { Event } from "@netlify/functions/src/function/event"
import type { IUser, ISession } from './types'


export async function createUser(user: IUser): Promise<string> {
	if ('_id' in user) {
		throw new Error('already has _id in userData')
	}
	const db = await connectToDatabase()
	db.logEvent(null, 'userCreate', {modifiedEmail: user.email})
	const res = await db.users.insertOne(user)
	return res.insertedId.toHexString()
}


export async function createSession(email: string): Promise<string> {
	const sid = crypto.randomBytes(32).toString('hex');
	const db = await connectToDatabase()
	const data: ISession = {
		email,
		sid,
	}
	db.logEvent(null, 'userLogin', {modifiedEmail: email})
	await db.sessions.insertOne(data)
	return sid
}


export function sidFromEvent(event: Event): string | null {
	if ('authorization' in event.headers) {
		const txt = event.headers.authorization as string
		if (txt.startsWith('Bearer sid:')) {
			return txt.substring(11)
		}
	}
	return null
}


export function keyFromEvent(event: Event): string | null {
	if ('authorization' in event.headers) {
		const txt = event.headers.authorization as string
		if (txt.startsWith('Bearer key:')) {
			return txt.substring(11)
		}
	}
	return null
}


export function sidFromParam(event: Event): string | null {
	const sid: string | null = (event.queryStringParameters && event.queryStringParameters.sid) || null
	return sid
}


export async function userEmailFromSid(sid: string): Promise<string | null> {
	const db = await connectToDatabase()
	const res = await db.sessions.findOne({sid})
	if (res) {
		return res.email
	}
	return null
}


export async function userEmailFromKey(key: string): Promise<string | null> {
	const db = await connectToDatabase()
	const res = await db.keys.findOne({key})
	if (res) {
		return res.email
	}
	return null
}


export async function userDataFromEmail(email: string): Promise<IUser | null> {
	const db = await connectToDatabase()
	const res = await db.users.findOne({email})
	if (res) {
		return res
	}
	return null
}


export async function userEmailFromEvent(event: Event): Promise<string | null> {
	const sid = sidFromEvent(event)
	if (sid) {
		return userEmailFromSid(sid)
	}
	const key = keyFromEvent(event)
	if (key) {
		return userEmailFromKey(key)
	}
	return null
}


export async function userDataFromEvent(event: Event): Promise<IUser | null> {
	const email = await userEmailFromEvent(event)
	if (!email)
		return null
	const data = await userDataFromEmail(email)
	if (!data)
		return null
	return data
}
