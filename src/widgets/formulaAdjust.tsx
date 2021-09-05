import { TName } from "../editor/types";
import { TransName } from "../translation";

interface TAdjust {
	id: string,
	category: string,
	name?: TName,
	func: (data: any, args: any[]) => string,
}

const lang = 'en'  // todo
// todo translate names

const n1: TAdjust = { id: 'num, 0 dec, local', category: 'number', func: (val: any) => { return val.toLocaleString(lang, {maximumFractionDigits:0})} }
const n2: TAdjust = { id: 'num, 2 dec, local', category: 'number', func: (val: any) => { return val.toLocaleString(lang, {maximumFractionDigits:2, minimumFractionDigits:2}) } }
const n3: TAdjust = { id: 'num, auto dec, local', category: 'number', func: (val: any) => { return val.toLocaleString(lang) } }
const n4: TAdjust = { id: 'num, 0 dec', category: 'number', func: (val: any) => { return val.toLocaleString('en-GB', {maximumFractionDigits:0}) } }
const n5: TAdjust = { id: 'num, 2 dec', category: 'number', func: (val: any) => { return val.toLocaleString('en-GB', {maximumFractionDigits:2, minimumFractionDigits:2}) } }
const n6: TAdjust = { id: 'num, auto dec', category: 'number', func: (val: any) => { return val.toLocaleString('en-GB') } }

const n7: TAdjust = { id: 'angle, 0 dec, local', category: 'number', func: (val: any) => { return (val/Math.PI*180).toLocaleString(lang, {maximumFractionDigits:0}) } }

const n8: TAdjust = { id: 'date and time, local', category: 'date', func: (val: any) => { return (new Date(val)).toLocaleString(lang) } }
const n9: TAdjust = { id: 'date and time no sec, local', category: 'date', func: (val: any) => { return (new Date(val)).toLocaleString(lang, {year:'numeric', month:'numeric', day:'numeric', hour:'numeric', minute:'numeric'}) } }
const n10: TAdjust = { id: 'date, local', category: 'date', func: (val: any) => { return (new Date(val)).toLocaleDateString(lang) } }
const n11: TAdjust = { id: 'time, local', category: 'date', func: (val: any) => { return (new Date(val)).toLocaleTimeString(lang) } }
const n12: TAdjust = { id: 'time no sec, local', category: 'date', func: (val: any) => { return (new Date(val)).toLocaleTimeString(lang, {hour: 'numeric', minute:'numeric'}) } }

const n13: TAdjust = { id: 'name', category: 'general', func: (val: any) => { return TransName(val, lang) } }
const n14: TAdjust = { id: 'json', category: 'general', func: (val: any) => {
	function simpleType(val: any) {
		if(typeof val == 'object') {
			if(val === null) { return '<null>' }
			if(val === undefined) { return '<undefined>' }
			if(Array.isArray(val)) { return '<array>' }
		}
		return '<' + (typeof val) + '>'
	}

	try {
		return JSON.stringify(val)
	}
	catch (err) {
		if(Array.isArray(val)) {
			let txt = ''
			for(const obj of val) {
				if(txt.length > 0) {
					txt += ', '
				}
				txt += simpleType(obj)
			}
			return '['+txt+']'
		}
		if(typeof val == 'object' && val) {
			let txt = ''
			for(const key of Object.keys(val)) {
				if(txt.length > 0) {
					txt += ', '
				}
				txt += '"'+key+'": '+simpleType(val[key])
			}
			return '{'+txt+'}'
		}
		throw err
	}
} }

export const listOfAdjusts: TAdjust[] = [
	n1,
	n2,
	n3,
	n4,
	n5,
	n6,
	n7,
	n8,
	n9,
	n10,
	n11,
	n12,
	n13,
	n14,
]
