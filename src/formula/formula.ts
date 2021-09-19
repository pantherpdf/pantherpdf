import { IHelpers } from './types'
import parse from './parse'
import toPostFix from './toPostFix'
import evaluatePostfix from './evaluate'


export default async function FormulaEvaluate(str: string, helpers?: IHelpers): Promise<unknown> {
	const expr = parse(str)
	const expr2 = toPostFix(expr)
	const result = await evaluatePostfix(expr2, helpers)
	return result
}
