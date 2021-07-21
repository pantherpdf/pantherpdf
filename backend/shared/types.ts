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

export interface TData { type: string, children: TData[] }
type TargetOption = 'pdf'|'json'|'csv-excel-utf-8'|'csv-windows-1250'

export interface IReport {
	email: string,
	name: string,
	time: string,
	target: TargetOption,
	children: TData[],
	properties: {
		font?: {[key: string]: string|number|boolean},
	}
}

export function TDataTypeGuard(r: any): r is TData {
	if (typeof r.type !== 'string' || r.type.length == 0)
		return false
	if (!Array.isArray(r.children))
		return false
	for (const ch of r.children) {
		if (!TDataTypeGuard(ch))
			return false
	}
	return true
}

export function ReportTypeGuard(r: any): r is IReport {
	if (typeof r != 'object')
		return false
	if (typeof r.email !== 'string')
		return false
	if (typeof r.name !== 'string')
		return false
	if (r.target !== 'pdf' && r.target !== 'json' && r.target !== 'csv-excel-utf-8' && r.target !== 'csv-windows-1250')
		return false
	if (!Array.isArray(r.children))
		return false
	for (const ch of r.children) {
		if (!TDataTypeGuard(ch))
			return false
	}
	if (typeof r.properties !== 'object')
		return false
	return true
}

export interface IReportShort {
	_id: string,
	target: TargetOption,
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


// Reports
export interface ReportNewRequest {
	name: string,
}
export function ReportNewRequestTypeGuard(r: any): r is ReportNewRequest {
	if (typeof r != 'object')
		return false
	if (!('name' in r) || typeof r.name != 'string')
		return false
	return true
}
export type ReportNewResponse = IReportShort | ErrorResponse

export interface ReportRemoveRequest {
	id: string,
}
export function ReportRemoveRequestTypeGuard(r: any): r is ReportRemoveRequest {
	if (typeof r != 'object')
		return false
	if (!('id' in r) || typeof r.id != 'string')
		return false
	return true
}
export type ReportRemoveResponse = { } | ErrorResponse

export type ReportResponse = { obj: WithId<IReport> } | ErrorResponse
