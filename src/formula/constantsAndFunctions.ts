function toColumnName(num: unknown) {
	if (typeof num !== 'number') {
		throw new Error('Not a number')
	}
	let ret, a, b
	for ( ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
		ret = String.fromCharCode(Math.floor((num % b) / a) + 65) + ret;
	}
	return ret;
}

function inArray(arr: unknown, val: unknown) {
	if( !Array.isArray(arr) )
		throw new Error('Not an array')
	return arr.indexOf(val) !== -1
}

function arrayIndexOf(arr: unknown, val: unknown) {
	if( !Array.isArray(arr) )
		throw new Error('Not an array')
	return arr.indexOf(val)
}

function substr2(txt: unknown, start: unknown, end: unknown) {
	if (typeof txt !== 'string') {
		throw new Error('text should be a string')
	}
	if (typeof start !== 'number') {
		throw new Error('start should be a number')
	}
	if (typeof end !== 'number' && end !== undefined) {
		throw new Error('end should be a number')
	}
	return txt.slice(start, end)
}


export const functions: {[key: string]: (...args: unknown[])=>unknown } = {
	'pow': (a, b) => { if (typeof a !== 'number') { throw new Error('bad a') } if (typeof b !== 'number') { throw new Error('bad b') } return Math.pow(a, b) },
	'not': (a) => !a,
	'columnName': (a) => toColumnName(a),
	'inArray': (a,b) => inArray(a, b),
	'arrayIndexOf': (a,b) => arrayIndexOf(a, b),
	'string': (a) => String(a),
	'str': (a) => String(a),
	'substr': substr2,
	'substring': substr2,
	'now': () => (new Date()).toISOString().substring(0,19)+'Z',
	'lower': (str) => { if (typeof str !== 'string') { throw new Error('not a string') } return str.toLowerCase() },
	'toLowerCase': (str) => { if (typeof str !== 'string') { throw new Error('not a string') } return str.toLowerCase() },
	'upper': (str) => { if (typeof str !== 'string') { throw new Error('not a string') } return str.toUpperCase() },
	'toUpperCase': (str) => { if (typeof str !== 'string') { throw new Error('not a string') } return str.toUpperCase() },
	'sin': (n) => { if (typeof n !== 'number') { throw new Error(`expected number but got ${typeof n}`) } return Math.sin(n) },
	'cos': (n) => { if (typeof n !== 'number') { throw new Error(`expected number but got ${typeof n}`) } return Math.cos(n) },
	'tan': (n) => { if (typeof n !== 'number') { throw new Error(`expected number but got ${typeof n}`) } return Math.tan(n) },
	'asin': (n) => { if (typeof n !== 'number') { throw new Error(`expected number but got ${typeof n}`) } return Math.asin(n) },
	'acos': (n) => { if (typeof n !== 'number') { throw new Error(`expected number but got ${typeof n}`) } return Math.acos(n) },
	'atan': (n) => { if (typeof n !== 'number') { throw new Error(`expected number but got ${typeof n}`) } return Math.atan(n) },
	'atan2': (y,x) => { if (typeof y !== 'number' || typeof x !== 'number') { throw new Error(`expected number but got ${typeof y} and ${typeof x}`) } return Math.atan2(y, x) },
}


export const constants: {[key: string]: unknown} = {
	'false': false,
	'true': true,
	'null': null,
	'pi': Math.PI,
	'PI': Math.PI,
}
