export interface IHelpers {
	getVar(name: string): Promise<any>,
}

export interface TSubExpr_function { type: 'function', arguments: TExpr[][], position: number }
export interface TSubExpr_variable_dyn { type: 'variable_dyn', expr: TExpr[], position: number }
export interface TSubExpr_variable { type: 'variable', name: string, position: number }
export type TSubExpr = TSubExpr_function | TSubExpr_variable_dyn | TSubExpr_variable

export interface TExpr_parentheses {type:'parentheses', expr: TExpr[], subexpr:TSubExpr[] }
export interface TExpr_number {type:'number', number: number, subexpr:TSubExpr[] }
export interface TExpr_string {type:'string', text: string, subexpr:TSubExpr[] }
export interface TExpr_array {type:'array', arguments: TExpr[][], subexpr:TSubExpr[] }
export interface TExpr_object {type:'object', object: {[key: string]: TExpr[]}, subexpr:TSubExpr[] }
export interface TExpr_variable {type:'variable', name:string, position:number, subexpr:TSubExpr[] }

type Narrowable = string | number | boolean | symbol | object | {} | void | null | undefined;
const tuple = <T extends Narrowable[]>(...args: T)=>args;
export const Operators = tuple('^', '*', '/', '+', '-', '==', '!=', '<', '>', '>=', '<=', '||', '&&');
export type TOperators = (typeof Operators)[number];
export interface TExpr_operator {type:'operator', name:TOperators, position:number}

export type TExpr = TExpr_parentheses | TExpr_number | TExpr_string | TExpr_array | TExpr_object | TExpr_operator | TExpr_variable


export class ParseError extends Error {
	position: number

	constructor(message: string, position: number) {
		super(message)
		// Object.setPrototypeOf(this, ParseError.prototype);  // transpile to ES6 or use this line
		this.position = position
	}
}

export class EvaluateError extends Error {
	position: number

	constructor(message: string, position: number) {
		super(message)
		// Object.setPrototypeOf(this, ParseError.prototype);  // transpile to ES6 or use this line
		this.position = position
	}
}
