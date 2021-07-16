//import type { ObjectId } from "mongodb"

export type WithId<T> = T & {_id: string}

export interface IUser {
	email: string,
	name: string,
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
