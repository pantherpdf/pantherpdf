/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import { EvaluateError, ParseError, type IHelpers } from './types';
import parse from './parse';
import toPostFix from './toPostFix';
import evaluatePostfix from './evaluate';

export default async function formulaEvaluate(
  str: string,
  helpers?: IHelpers,
): Promise<unknown> {
  try {
    const expr = parse(str);
    const expr2 = toPostFix(expr);
    const result = await evaluatePostfix(
      expr2,
      helpers || { getVar: () => undefined },
    );
    return result;
  } catch (err) {
    if (err instanceof ParseError || err instanceof EvaluateError) {
      throw new Error(
        `${err.message}\nFormula: ${str}\nPosition: ${err.position}`,
      );
    }
    throw err;
  }
}
