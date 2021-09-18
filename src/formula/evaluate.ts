import { TExpr, IHelpers, TOperators, EvaluateError } from './types'
import { constants, functions } from './constantsAndFunctions'


let cacheFunctions: string[] | undefined
let cacheConstants: string[] | undefined
async function getVariable(name: string, helpers?: IHelpers): Promise<any> {
	// user defined
	if (helpers && helpers.vars) {
		if (Object.keys(helpers.vars).indexOf(name) !== -1) {
			return helpers.vars[name]
		}
	}

	// user defined
	if (helpers && helpers.getVar) {
		const val = await helpers.getVar(name)
		if (val !== undefined)
			return val
	}

	// functions
	if (!cacheFunctions)
		cacheFunctions = Object.keys(functions)
	if (cacheFunctions.indexOf(name) !== -1)
		return functions[name]

	// constants
	if (!cacheConstants)
		cacheConstants = Object.keys(constants)
	if (cacheConstants.indexOf(name) !== -1)
		return constants[name]

	return undefined
}


// https://stackoverflow.com/a/16788517
function objectEquals(x: any, y: any): boolean {
    if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
    // after this just checking type of one would be enough
    if (x.constructor !== y.constructor) { return false; }
    // if they are functions, they should exactly refer to same one (because of closures)
    if (x instanceof Function) { return x === y; }
    // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
    if (x instanceof RegExp) { return x === y; }
    if (x === y || x.valueOf() === y.valueOf()) { return true; }
    if (Array.isArray(x) && x.length !== y.length) { return false; }

    // if they are dates, they must had equal valueOf
    if (x instanceof Date) { return false; }

    // if they are strictly equal, they both need to be object at least
    if (!(x instanceof Object)) { return false; }
    if (!(y instanceof Object)) { return false; }

    // recursive object equality check
    var p = Object.keys(x);
    return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) &&
        p.every(function (i) { return objectEquals(x[i], y[i]); });
}


export function evaluateOperator(op: TOperators, a: any, b: any, pos: number): any {
	// logical operators
	if( op === '==' )
		return objectEquals(a,b)
	if( op === '!=' )
		return !objectEquals(a,b)
	if( op === '<' )
		return a < b
	if( op === '>' )
		return a > b
	if( op === '>=' )
		return a >= b
	if( op === '<=' )
		return a <= b
	if( op === '||' )
		return a || b
	if( op === '&&' )
		return a && b

	// number operators
	if (typeof a === 'number' && typeof b === 'number') {
		if( op === '^' )
			return Math.pow(a,b)
		if( op === '*' )
			return a*b
		if( op === '/' )
			return a/b
		if( op === '+' )
			return a+b
		if( op === '-' )
			return a-b
	}

	// string
	if (typeof a === 'string') {
		if (op === '+')
			return String(a) + String(b)
	}

	// array
	if (Array.isArray(a) && Array.isArray(b) && op === '+') {
		return [...a, ...b]
	}

	// error
	throw new EvaluateError(`Operator ${op} is not defined for ${typeof a} and ${typeof b}`, pos)
}


export default async function evaluatePostfix(expr: TExpr[], helpers?: IHelpers): Promise<any> {
	if (expr.length === 0) {
		return undefined
	}

	const stack: any[] = []

	for (const part of expr) {
		// operator
		if (part.type === 'operator') {
			if (stack.length < 2) {
				throw new EvaluateError('Need two values for an operator', part.position)
			}
			const a: any = stack[stack.length-2]
			const b: any = stack[stack.length-1]
			stack.splice(stack.length-2, 2)
			const value = evaluateOperator(part.name, a, b, part.position)
			stack.push(value)
			continue
		}

		// extract value
		let value: any
		if (part.type === 'number') {
			value = part.number
		}
		else if (part.type === 'string') {
			value = part.text
		}
		else if (part.type === 'variable') {
			value = await getVariable(part.name, helpers)
			if (value === undefined) {
				throw new EvaluateError(`Unknown variable ${part.name}`, part.position)
			}
		}
		else if (part.type === 'parentheses') {
			value = await evaluatePostfix(part.expr, helpers)
		}
		else if (part.type === 'array') {
			value = await Promise.all(part.arguments.map(expr2 => evaluatePostfix(expr2, helpers)))
		}
		else if (part.type === 'object') {
			value = { }
			await Promise.all(Object.keys(part.object).map(async (k: string) => { value[k] = await evaluatePostfix(part.object[k], helpers) }))
		}
		else {
			throw new Error('unknown part type')
		}

		// subexpr
		for (const sub of part.subexpr) {
			if (!value) {
				throw new EvaluateError('Cant evaluate subexpr', sub.position)
			}

			// function
			if (sub.type === 'function') {
				if (!(value instanceof Function)) {
					throw new EvaluateError('Value is not callable', sub.position)
				}
				const args = await Promise.all(sub.arguments.map(expr2 => evaluatePostfix(expr2, helpers)))
				try {
					value = await value(...args)
				}
				catch(e) {
					if (e instanceof EvaluateError)
						throw e
					const msg = (e instanceof Error) ? e.message : (typeof e === 'string' ? e : 'unknown error while calling a function')
					throw new EvaluateError(msg, sub.position)
				}
			}

			// variable
			else if (sub.type === 'variable' || sub.type === 'variable_dyn') {
				const key = sub.type==='variable' ? sub.name : await evaluatePostfix(sub.expr, helpers)
				if (Array.isArray(value) && typeof key === 'number') {
					value = await value[key]
				}
				else {
					// prevent __proto__ and other built-in
					if (Object.keys(value).indexOf(key) !== -1) {
						value = await value[key]
					}
					else {
						value = undefined
					}
				}
			}

			// unknown
			else {
				throw new Error('unknown part type')
			}
		}

		stack.push(value)
	}

	// result should be on stack
	if (stack.length === 1)
		return stack[0]

	throw new EvaluateError('Bad formula', 0)
}
