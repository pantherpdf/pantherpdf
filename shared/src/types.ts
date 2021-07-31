//import type { ObjectId } from "mongodb"

// helper for converting tuple into type
type Narrowable = string | number | boolean | symbol | object | {} | void | null | undefined;
const tuple = <T extends Narrowable[]>(...args: T)=>args;


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

export interface IReportGenerated {
	email: string,
	time: string,
	html: string,
	reportId: string,
	accessKey: string,
}

export interface TData {
	[key: string]: any,
	type: string,
	children: TData[],
}

export const TargetOptions = tuple('pdf', 'json', 'csv-excel-utf-8', 'csv-windows-1250');
export type TargetOption = (typeof TargetOptions)[number];
export function TargetOptionTypeGuard(r: any): r is TargetOption {
	if (typeof r !== 'string')
		return false
	if ((TargetOptions as string[]).indexOf(r) === -1)
		return false
	return true
}

export interface TTransformData {
	[key: string]: any,
	type: string,
	comment: string,
}

export interface TReport {
	_id: string,
	name: string,
	email: string,
	time: string,
	target: TargetOption,
	children: TData[],
	transforms: TTransformData[],
	properties: {
		font?: any,
		margin?: [number, number, number, number],
		fileName?: string,
		paperWidth?: number,
		paperHeight?: number,
		lang?: string,
	}
}
export type TReportWithoutId = Omit<TReport, '_id'>

export interface TDataCompiled {
	[key: string]: any,
	type: string,
	children: TDataCompiled[],
}

export interface TReportCompiled extends Omit<TReport, 'children'> {
	children: TDataCompiled[],
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

export function ReportTypeGuard(r: any): r is TReport {
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

export interface TReportShort {
	_id: string,
	name: string,
	target: TargetOption,
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

export interface TFileShort {
	name: string,
	mimeType: string,
	uploadTime: string,
	modifiedTime: string,
	size: number,
}


export interface ApiEndpoints {
	reportGet: (id: string) =>  Promise<ReportResponse2>,
	files: () =>  Promise<FilesResponse2>,
	filesDelete: (name: string) =>  Promise<void>,
	filesUpload: (file: File, data: FileUploadData, cbProgress: (prc: number) => void) =>  Promise<void>,
	filesDownloadUrl: (name: string) => string,
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
export type UserDataResponse = { user: IUser, reports: TReportShort[] } | ErrorResponse


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

export type ReportResponse2 = { obj: WithId<TReport> }
export type ReportResponse = ReportResponse2 | ErrorResponse






export type FilesResponse2 = { files: TFileShort[] }
export type FilesResponse = FilesResponse2 | ErrorResponse

export interface FileUploadData {
	name: string,
	modifiedTime: string,
	mimeType: string,
}

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
