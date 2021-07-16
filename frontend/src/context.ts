import React from 'react'
import type { IReportShort, IUserWithId } from '../../types'


export interface IAppContextData {
	user: IUserWithId | null,
	reports: IReportShort[],
}

export interface IAppContextCB extends IAppContextData {
	setSid: (sid: string) => Promise<void>,
	logout: () => Promise<void>,
}

export function AppContextDefaultData(): IAppContextData {
	return {
		user: null,
		reports: [],
	}
}

export function AppContextDefaultCB(): IAppContextCB {
	return {
		...AppContextDefaultData(),
		setSid: async (sid: string) => {},
		logout: async () => {},
	}
}

export const AppContext = React.createContext<IAppContextCB>(AppContextDefaultCB());

export function getApp(data: IAppContextData, setData: React.Dispatch<React.SetStateAction<IAppContextData>>) : IAppContextCB {
	const app: IAppContextCB = {
		...data,
		setSid: async (sid: string) => {
			const r = await fetch('/.netlify/functions/userData', {headers: {Authorization: `Bearer ${sid}`}})
			const js = await r.json()
			if (!r.ok) {
				window.localStorage.removeItem('sid')
				setData({...data, user: null})
				const msg: string = (js && typeof js.msg === 'string') ? js.msg : 'Unknown error'
				alert(`Error: ${msg}`)
				return
			}
			const userData = js as IUserWithId
			window.localStorage.setItem('sid', sid)
			setData({...data, user: userData})
		},
		logout: async () => {
			const sid = window.localStorage.getItem('sid')
			window.localStorage.removeItem('sid')
			setData({...data, user: null})
			if (sid && sid.length > 0) {
				await fetch('/.netlify/functions/logout', {method: 'POST', headers: {Authorization: `Bearer ${sid}`}})
			}
		},
	}
	return app
}