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


// keys
export interface IKey {
	key: string,
	name: string,
	email: string,
	time: string,
}
export interface IKeyPublicShort {
	name: string,
	time: string,
}
export type KeysResponse = IKeyPublicShort[] | ErrorResponse

export type KeyAddRequest = { name: string }
export function KeyAddRequestTypeGuard(r: any): r is KeyAddRequest {
	if (typeof r != 'object')
		return false
	if (!('name' in r) || typeof r.name != 'string')
		return false
	return true
}
export type KeyAddResponse = (IKeyPublicShort&{ key: string, }) | ErrorResponse

export type KeyRemoveRequest = { name: string }
export function KeyRemoveRequestTypeGuard(r: any): r is KeyRemoveRequest {
	if (typeof r != 'object')
		return false
	if (!('name' in r) || typeof r.name != 'string')
		return false
	return true
}
export type KeyRemoveResponse = { } | ErrorResponse

export type KeyUpdateRequest = { nameOld: string, nameNew: string }
export function KeyUpdateRequestTypeGuard(r: any): r is KeyUpdateRequest {
	if (typeof r != 'object')
		return false
	if (!('nameOld' in r) || typeof r.nameOld != 'string')
		return false
	if (!('nameNew' in r) || typeof r.nameNew != 'string')
		return false
	return true
}


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
