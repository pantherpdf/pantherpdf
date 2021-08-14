import { CSSProperties } from "react";

// helper for converting tuple into type
type Narrowable = string | number | boolean | symbol | object | {} | void | null | undefined;
export const tuple = <T extends Narrowable[]>(...args: T)=>args;

export type WithId<T> = T & {_id: string}


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
	version: string,
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

export interface TReportShort {
	_id: string,
	name: string,
	target: TargetOption,
	version: string,
}

export interface TDataCompiled {
	[key: string]: any,
	type: string,
	children: TDataCompiled[],
}

export interface TReportCompiled extends Omit<TReport, 'children'> {
	children: TDataCompiled[],
}

export function TDataTypeGuard(r: any): r is TData {
	if (typeof r.type !== 'string' || r.type.length === 0)
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


export interface TFileShort {
	name: string,
	mimeType: string,
	uploadTime: string,
	modifiedTime: string,
	size: number,
}

export interface FileUploadData {
	name: string,
	modifiedTime: string,
	mimeType: string,
}


export type ReportResponseBase = { obj: WithId<TReport> }
export type FilesResponseBase = { files: TFileShort[] }
export interface ApiEndpoints {
	reportGet: (id: string) =>  Promise<ReportResponseBase>,
	files: () =>  Promise<FilesResponseBase>,
	filesDelete: (name: string) =>  Promise<void>,
	filesUpload: (file: File, data: FileUploadData, cbProgress: (prc: number) => void) =>  Promise<void>,
	filesDownloadUrl: (name: string) => string,
	fonts: () => Promise<string[]>,
}



export const defaultReportCss: CSSProperties = {
	fontFamily: 'arial, serif',
	fontSize: '12pt',
	color: '#000000',
}
