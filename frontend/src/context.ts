import React from 'react'
import type { IReportShort, IUser, UserDataResponse, ReportNewRequest, ReportNewResponse } from '../../backend/shared/types'


export interface IAppContextData {
	user: IUser | null,
	sid: string | null,
	reports: IReportShort[],
}

export interface IAppContextCB extends IAppContextData {
	setSid: (sid: string) => Promise<void>,
	logout: () => Promise<void>,
	reportNew: (name: string) => Promise<string>,
}

export function AppContextDefaultData(): IAppContextData {
	return {
		user: null,
		sid: null,
		reports: [],
	}
}

export function AppContextDefaultCB(): IAppContextCB {
	return {
		...AppContextDefaultData(),
		setSid: async (sid) => {},
		logout: async () => {},
		reportNew: async (name) => { throw new Error('Not implemented') },
	}
}

export const AppContext = React.createContext<IAppContextCB>(AppContextDefaultCB());

export function getApp(data: IAppContextData, setData: React.Dispatch<React.SetStateAction<IAppContextData>>) : IAppContextCB {
	const app: IAppContextCB = {
		...data,
		setSid: async (sid: string) => {
			const r = await fetch('/.netlify/functions/userData', {headers: {Authorization: `Bearer sid:${sid}`}})
			const js = await r.json() as UserDataResponse
			if (!r.ok) {
				window.localStorage.removeItem('sid')
				setData({...data, user: null})
				const msg: string = (js && 'msg' in js) ? js.msg : 'Unknown error'
				alert(`Error: ${msg}`)
				return
			}
			window.localStorage.setItem('sid', sid)
			setData({...data, sid, ...js})
		},
		logout: async () => {
			const sid = window.localStorage.getItem('sid')
			window.localStorage.removeItem('sid')
			setData({...data, sid:null, user: null})
			if (sid && sid.length > 0) {
				await fetch('/.netlify/functions/logout', {method: 'POST', headers: {Authorization: `Bearer sid:${sid}`}})
			}
		},
		reportNew: async (name) => {
			const rq: ReportNewRequest = { name }
			const r = await fetch('/.netlify/functions/reportsAdd', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer sid:${app.sid}` },
				body: JSON.stringify(rq),
			})
			const js = await r.json() as ReportNewResponse
			if (!r.ok || 'msg' in js) {
				const msg = 'msg' in js ? js.msg : 'unknown error'
				alert(`Error: ${msg}`)
				throw new Error(msg)
			}
			setData({...data, reports:[...data.reports, js]})
			return js._id
		}
	}
	return app
}
