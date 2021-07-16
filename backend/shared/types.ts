//import type { ObjectId } from "mongodb"

export type WithId<T> = T & {_id: string}

export interface IUser {
	email: string,
	name: string,
	anonymousId?: string,
}
export type IUserWithId = WithId<IUser>

export interface ISession {
	email: string,
	sid: string,
}

export interface IReport {
	email: string,
	name: string,
}

export interface IReportShort {
	id: string,
	name: string,
}


export interface ErrorResponse { msg: string }


// loginAnonymous
export interface LoginAnonymousRequest { anonymousId?: string }
export function LoginAnonymousRequestTypeGuard(r: any): r is LoginAnonymousRequest {
	if (typeof r != 'object')
		return false
	if ('anonymousId' in r) {
		if (typeof r.anonymousId != 'string')
			return false
		if (r.anonymousId.length == 0)
			return false
	}
	return true
}
export type LoginAnonymousResponse = { sid: string, anonymousId: string } | ErrorResponse


// userData
export type UserDataResponse = { user: IUser, reports: IReportShort[] } | ErrorResponse


// events
export interface IEvent {
	email?: string,
	sid?: string,
	key?: string,
	ip?: string,
	userAgent?: string,
	time: string,
	type: string,
	[x: string]: any 
}
