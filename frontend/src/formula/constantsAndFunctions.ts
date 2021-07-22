function toColumnName(num: any) {
	if (typeof num !== 'number') {
		throw new Error('Not a number')
	}
	let ret, a, b
	for ( ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
		ret = String.fromCharCode(Math.floor((num % b) / a) + 65) + ret;
	}
	return ret;
}

function inArray(arr: any, val: any) {
	if( !Array.isArray(arr) )
		throw new Error('Not an array')
	return arr.indexOf(val) !== -1
}

function arrayIndexOf(arr: any, val: any) {
	if( !Array.isArray(arr) )
		throw new Error('Not an array')
	return arr.indexOf(val)
}

function substr2(txt: any, start: any, end: any) {
	return txt.slice(start, end)
}


export const functions: {[key: string]: (...args: any[])=>any } = {
	'pow': (a, b) => Math.pow(a, b),
	'not': (a) => !a,
	'columnName': (a) => toColumnName(a),
	'inArray': (a,b) => inArray(a, b),
	'arrayIndexOf': (a,b) => arrayIndexOf(a, b),
	'string': (a) => String(a),
	'str': (a) => String(a),
	'substr': substr2,
	'substring': substr2,
	'now': () => (new Date()).toISOString(),
	'lower': (str) => { if (typeof str !== 'string') { throw new Error('not a string') } return str.toLowerCase() },
	'toLowerCase': (str) => { if (typeof str !== 'string') { throw new Error('not a string') } return str.toLowerCase() },
	'upper': (str) => { if (typeof str !== 'string') { throw new Error('not a string') } return str.toUpperCase() },
	'toUpperCase': (str) => { if (typeof str !== 'string') { throw new Error('not a string') } return str.toUpperCase() },
}


export const constants: {[key: string]: any} = {
	'false': false,
	'true': true,
	'null': null,
}
