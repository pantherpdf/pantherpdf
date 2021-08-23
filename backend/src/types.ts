import type { TReport, TReportShort, FilesResponseBase, ReportResponseBase, FileUploadData, TFileShort } from 'reports-shared'


export type WithId<T> = T & {_id: string}
export interface ErrorResponse { msg: string }



// DB schema

export interface IUser {
	email: string,
	name: string,
	anonymousId?: string,
}

export interface IKey {
	key: string,
	name: string,
	email: string,
	time: string,
}

export interface ISession {
	email: string,
	sid: string,
}

export type TReportWithoutId = Omit<TReport, '_id'>

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

export interface TFile {
	email: string,
	name: string,
	mimeType: string,
	uploadTime: string,
	modifiedTime: string,
	data: Buffer,
	size: number,
}

export interface IReportGenerated {
	email: string,
	time: string,
	html: string,
	reportId: string,
	accessKey: string,
}







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
export type UserDataResponse = { user: IUser, reports: TReportShort[] } | ErrorResponse


// keys
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
export type ReportNewResponse = TReportShort | ErrorResponse

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


export type ReportResponse = ReportResponseBase | ErrorResponse











export type FilesResponse = FilesResponseBase | ErrorResponse


export function FileUploadDataTypeGuard(r: any): r is FileUploadData {
	if (typeof r !== 'object')
		return false
	if (!('name' in r) || typeof r.name !== 'string')
		return false
	if (!('modifiedTime' in r) || typeof r.modifiedTime !== 'string')
		return false
	const rgx = /^[\d]{4}-[\d]{2}-[\d]{2}T[\d]{2}:[\d]{2}:[\d]{2}Z$/gm
	if (!r.modifiedTime.match(rgx))
		return false
	if (!('mimeType' in r) || typeof r.mimeType !== 'string')
		return false
	return true
}

export type FileUploadResponse = {file: TFileShort} | ErrorResponse




export type GenerateRequest = { dataUrl?: string, data?: any }
export function GenerateRequestTypeGuard(r: any): r is GenerateRequest {
	if (typeof r != 'object')
		return false
	let numKeys = 0;
	if ('dataUrl' in r) {
		numKeys++
		if (typeof r.dataUrl !== 'string')
			return false
	}
	if ('data' in r) {
		numKeys++
	}
	if (Object.keys(r).length !== numKeys)
		return false
	return true
}
export type GenerateResponseBase = { accessKey: string }
export type GenerateResponse = GenerateResponseBase | ErrorResponse




export type GeneratePdfResponseBase = { id: string, status: 'waiting'|'working'|'finished', errorMsg?: string }
export type GeneratePdfResponse = GeneratePdfResponseBase | ErrorResponse






export type ContactSendMessageRequest = { email: string, message: string, captchaToken: string }
export function ContactSendMessageRequestTypeGuard(r: any): r is ContactSendMessageRequest {
	if (typeof r != 'object')
		return false
	if (Object.keys(r).length !== 3)
		return false
	if (!('email' in r) || typeof r.email != 'string')
		return false
	if (!('message' in r) || typeof r.message != 'string')
		return false
	if (!('captchaToken' in r) || typeof r.captchaToken != 'string')
		return false
	return true
}
export type ContactSendMessageResponse = {} | ErrorResponse
