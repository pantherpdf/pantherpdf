/**
 * types.ts
 * types used in report editor
 */


import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { FunctionComponent, ReactNode } from 'react'
import type { Helper } from './compile'
import type { TFont } from '../widgets/PropertyFont'

export type TName = string | {[key: string]: string}
export interface TFontAwesomeIcon { fontawesome: IconDefinition }


export interface TData {
	[key: string]: any,
	type: string,
	children: TData[],
}

// to help construct tests
// to force specific children type
export type ForceChildren<T> = T | {[key:string]: any, children: ForceChildren<T>[]}

export interface TDataCompiled {
	[key: string]: any,
	type: string,
	children: TDataCompiled[],
}

export interface TReport {
	_id: string,
	name: TName,
	target: 'pdf'|'json'|'csv-excel-utf-8'|'csv-windows-1250',
	children: TData[],
	properties: {
		font?: TFont,
	}
}
export type ReportForceChildren<T> = TReport & { children: ForceChildren<T>[] }

export interface TReportCompiled extends Omit<TReport, 'children'> {
	children: TDataCompiled[],
}



export type TDragObj = {type:'wid', wid: number[]} | {type:'widget', widget: TData} | {type:'widgets', widgets: TData[]}

export interface GeneralProps {
	allReports: TReportShort[],
	sourceData: any,

	report: TReport,
	setReport: (report: TReport) => Promise<void>,

	selected: number[] | null,
	setSelected: React.Dispatch<React.SetStateAction<number[]|null>>,

	renderWidget: (child: TData, parents: number[]) => ReactNode,
	renderWidgets: (children: TData[], parents: number[]) => ReactNode,
	dragWidgetStart: (e: React.DragEvent<HTMLDivElement>, dragObj: TDragObj) => void,
	dragWidgetEnd: (e: React.DragEvent<HTMLDivElement>) => void,
	drop: (e: React.DragEvent<HTMLDivElement>, dest: number[]) => void,
}

export interface ItemRendeProps extends GeneralProps {
	item: TData,
	setItem: (itm: TData) => void,
	wid: number[],
}

export interface Widget {
	name: TName,
	icon: TFontAwesomeIcon,
	newItem: () => Promise<TData>,
	compile: (dt: any, helper: Helper) => Promise<TDataCompiled>,
	RenderProperties?: FunctionComponent<ItemRendeProps>,
	Render: FunctionComponent<ItemRendeProps>,
}

export interface TReportShort {
	_id: string,
	name: string,
	type: string,
}
