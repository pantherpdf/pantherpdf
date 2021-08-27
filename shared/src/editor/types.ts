/**
 * types.ts
 * types used in report editor
 */


import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { FunctionComponent, ReactNode } from 'react'
import type { FormulaHelper } from './compile'
import { TReport, TReportShort, TData, TTransformData, ApiEndpoints, TDataCompiled } from '../types'



export type TName = string | {[key: string]: string}
export interface TFontAwesomeIcon { fontawesome: IconDefinition }




// to help construct tests
// to force specific children type
export type ForceChildren<T> = T | {[key:string]: any, children: ForceChildren<T>[]}






export type ReportForceChildren<T> = TReport & { children: ForceChildren<T>[] }





export type TDragObj = {type:'wid', wid: number[]} | {type:'widget', widget: TData} | {type:'widgets', widgets: TData[]}

export interface GeneralProps {
	getOriginalSourceData: (report: TReport) => any,
	overrideSourceData: (data: any) => void,
	isOverridenSourceData: boolean,
	sourceData: any,
	sourceErrorMsg?: string | undefined,
	refreshSourceData: (report: TReport) => void,
	api: ApiEndpoints,

	report: TReport,
	setReport: (report: TReport) => Promise<void>,
	deleteReport: () => void,

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

export interface ItemRendeFinalHelper {
	renderItem: (item: TDataCompiled, helper: ItemRendeFinalHelper) => ReactNode,
	renderChildren: (chs: TDataCompiled[], helper: ItemRendeFinalHelper) => ReactNode,
}

export interface ItemRendeFinalProps extends ItemRendeFinalHelper {
	item: TDataCompiled,
}

export interface CompileHelper {
	formulaHelper: FormulaHelper,
	evalFormula: (txt: string) => Promise<any>,
	compileChildren: (arr1: TData[], helper: CompileHelper) => Promise<TDataCompiled[]>,
	wid: number[],
	report: TReport,
	api?: ApiEndpoints,
}

export interface NewItemProps {
	report: TReport,
}

export interface Widget {
	name: TName,
	icon: TFontAwesomeIcon,
	newItem: (props: NewItemProps) => Promise<TData>,
	compile: (dt: any, helper: CompileHelper) => Promise<TDataCompiled>,
	RenderProperties?: FunctionComponent<ItemRendeProps>,
	Render: FunctionComponent<ItemRendeProps>,
	RenderFinal: FunctionComponent<ItemRendeFinalProps>,
	canAdd?: boolean,
	canDrag?: boolean,
	canSelect?: boolean,
}


export interface TransformRendeProps extends GeneralProps {
	item: TTransformData,
	setItem: (itm: TTransformData) => void,
	index: number,
}


export interface TTransformWidget {
	name: TName,
	newItem: () => Promise<TTransformData>,
	transform: (dt: any, item: TTransformData) => Promise<any>,
	Editor: FunctionComponent<TransformRendeProps>,
}

