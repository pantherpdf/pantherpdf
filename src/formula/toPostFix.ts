/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import { TExpr, TExpr_operator, TOperators } from './types';

const precedence: { [key in TOperators]: number } = {
  '&&': -1,
  '||': -1,
  '==': 0,
  '!=': 0,
  '<': 0,
  '>': 0,
  '<=': 0,
  '>=': 0,
  '^': 3,
  '*': 2,
  '/': 2,
  '+': 1,
  '-': 1,
};

export default function toPostFix(expr: TExpr[]): TExpr[] {
  const expr2: TExpr[] = [];
  const stack: TExpr_operator[] = [];
  for (let part of expr) {
    // sub
    if (part.type !== 'operator' && part.subexpr.length > 0) {
      const subexpr = part.subexpr.map(s => {
        if (s.type === 'function') {
          return {
            ...s,
            arguments: s.arguments.map(expr2 => toPostFix(expr2)),
          };
        } else if (s.type === 'variable_dyn') {
          return { ...s, expr: toPostFix(s.expr) };
        } else if (s.type === 'variable') {
          return s;
        } else {
          throw new Error('Bad');
        }
      });
      part = { ...part, subexpr };
    }

    if (
      part.type === 'number' ||
      part.type === 'variable' ||
      part.type === 'string'
    ) {
      expr2.push(part);
    } else if (part.type === 'parentheses') {
      const part2 = { ...part, expr: toPostFix(part.expr) };
      expr2.push(part2);
    } else if (part.type === 'array') {
      const part2 = {
        ...part,
        arguments: part.arguments.map(expr2 => toPostFix(expr2)),
      };
      expr2.push(part2);
    } else if (part.type === 'object') {
      const obj2 = part.object;
      const obj3: { [key: string]: TExpr[] } = {};
      const keys = Object.keys(obj2);
      keys.map(k => (obj3[k] = toPostFix(obj2[k])));
      const part2 = { ...part, object: obj3 };
      expr2.push(part2);
    } else if (part.type === 'operator') {
      while (
        stack.length > 0 &&
        precedence[part.name] <= precedence[stack[stack.length - 1].name]
      ) {
        const part2 = stack[stack.length - 1];
        stack.splice(stack.length - 1, 1);
        expr2.push(part2);
      }
      stack.push(part);
    } else {
      throw new Error('Unknown type.');
    }
  }
  return expr2.concat(stack.reverse());
}
