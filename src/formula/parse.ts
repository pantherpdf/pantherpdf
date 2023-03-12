import {
  TExpr,
  ParseError,
  TSubExpr_variable_dyn,
  TSubExpr_variable,
  TSubExpr_function,
  Operators,
  TOperators,
  TSubExpr,
} from './types';

/*
 PARSE: functions to parse string formula into tokens
*/

export function isWhiteSpace(ch: string): boolean {
  if (ch.length !== 1) {
    throw new Error('bad params');
  }
  return (
    ch === ' ' ||
    ch === '\n' ||
    ch === '\t' ||
    ch === '\r' ||
    ch === '\u00A0' ||
    ch === '\u2028' ||
    ch === '\u2029' ||
    ch === '\uFEFF'
  );
}

export function skipWhitespace(str: string, i: number): number {
  if (i > str.length) {
    throw new Error('bad params');
  }
  while (i < str.length && isWhiteSpace(str[i])) {
    i += 1;
  }
  return i;
}

export function isNum(ch: string): boolean {
  if (ch.length !== 1) {
    throw new Error('bad params');
  }
  return ch >= '0' && ch <= '9';
}

export function isAl(ch: string): boolean {
  if (ch.length !== 1) {
    throw new Error('bad params');
  }
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
}

export function validVarChar(ch: string): boolean {
  if (ch.length !== 1) {
    throw new Error('bad params');
  }
  return isAl(ch) || isNum(ch) || ch === '_';
}

export function isOperatorTypeGuard(r: any): r is TOperators {
  if (typeof r !== 'string') {
    return false;
  }
  return (Operators as string[]).indexOf(r) !== -1;
}

const oprMaxLen = Math.max(...Operators.map(o => o.length));
export function extractOperator(str: string, i: number): TOperators | null {
  const remaining = str.length - i;
  for (let l = Math.min(oprMaxLen, remaining); l >= 1; --l) {
    const str2 = str.substring(i, i + l);
    if (isOperatorTypeGuard(str2)) {
      return str2;
    }
  }
  return null;
}

// parsing for array and function arguments
interface IParseArgsRes {
  args: TExpr[][];
  endPos: number;
}
export function parseArgs(str: string, i: number): IParseArgsRes {
  if (i >= str.length) {
    throw new Error('Bad params');
  }

  const startCh = str[i];
  let endCh;
  i += 1;
  if (startCh === '(') {
    endCh = ')';
  } else if (startCh === '[') {
    endCh = ']';
  } else {
    throw new Error('Bad params');
  }

  const args: TExpr[][] = [];
  i = skipWhitespace(str, i);

  if (i >= str.length) {
    throw new ParseError(`Missing closing char: ${endCh}`, i);
  }
  if (str[i] === endCh) {
    return { args, endPos: i + 1 };
  }

  while (true) {
    const result = parseImpl(str, i, [endCh, ',']);
    if (result.expr.length === 0) {
      throw new ParseError('Missing expression', i);
    }
    i = result.endPos;
    args.push(result.expr);

    if (str[i - 1] === endCh) {
      return { args, endPos: i };
    }

    // assert ch2 === ','
    i = skipWhitespace(str, i);
  }
}

interface IParseStringRes {
  str: string;
  endPos: number;
}
export function parseString(str: string, i: number): IParseStringRes {
  if (i >= str.length || (str[i] !== "'" && str[i] !== '"')) {
    throw new ParseError('Bad string', i);
  }
  const endCh = str[i];
  i += 1;

  let txt = '';
  while (true) {
    if (i >= str.length) {
      throw new ParseError('Unexpected end of string', i);
    }
    let ch = str[i];

    // end of string
    if (ch === endCh) {
      i = i + 1;
      break;
    }

    // escape char
    else if (ch === '\\') {
      const toEscape: { [key: string]: string } = {
        "'": "'",
        '"': '"',
        n: '\n',
        t: '\t',
        r: '\r',
      };
      i += 1;
      if (i >= str.length) {
        throw new ParseError('Bad escape. Unexpected end-of-string.', i - 1);
      }
      ch = str[i];
      if (ch in toEscape) {
        txt += toEscape[ch];
      } else {
        throw new ParseError('Bad escape. Unknown char', i);
      }
    }

    // part of string
    else {
      txt += ch;
    }

    i += 1;
  }
  return { str: txt, endPos: i };
}

export function parseVar(str: string, i: number): IParseStringRes {
  if (i >= str.length || !validVarChar(str[i]) || isNum(str[i])) {
    throw new ParseError('Unknown char in string', i);
  }

  let name = '';
  while (i < str.length && validVarChar(str[i])) {
    name += str[i];
    i += 1;
  }
  return { str: name, endPos: i };
}

interface IParseNumRes {
  number: number;
  endPos: number;
}
export function parseNum(str: string, i: number): IParseNumRes {
  if (i >= str.length) {
    throw new Error('bad args');
  }

  let hasDot = false;
  const i_start = i;
  while (i < str.length && (isNum(str[i]) || str[i] === '.')) {
    if (str[i] === '.') {
      if (hasDot) {
        throw new ParseError('Second dot in number', i);
      }
      hasDot = true;
    }
    i += 1;
  }
  const txt = str.substring(i_start, i);

  let num: number;
  if (hasDot) {
    if (txt[txt.length - 1] === '.') {
      throw new ParseError('Dot in the end of number', i);
    }
    num = parseFloat(txt);
  } else {
    num = parseInt(txt);
  }
  if (!isFinite(num)) {
    throw new ParseError('Bad number', i_start);
  }
  return { number: num, endPos: i };
}

interface IParsePartRes {
  part: TExpr;
  endPos: number;
}
export function parsePart(str: string, i: number): IParsePartRes {
  i = skipWhitespace(str, i);
  if (i >= str.length) {
    throw new Error('Bad param');
  }

  let ch = str[i];
  let part: TExpr;

  // string
  if (ch === "'" || ch === '"') {
    const result = parseString(str, i);
    part = { type: 'string', text: result.str, subexpr: [] };
    i = result.endPos;
  }

  // array
  else if (ch === '[') {
    const result = parseArgs(str, i);
    part = { type: 'array', arguments: result.args, subexpr: [] };
    i = result.endPos;
  }

  // variable or function
  else if (validVarChar(ch) && !isNum(ch)) {
    const start_i = i;
    const result = parseVar(str, i);
    i = result.endPos;
    const name = result.str;

    part = { type: 'variable', name, position: start_i, subexpr: [] };
  }

  // parentheses
  else if (ch === '(') {
    i += 1;
    const result = parseImpl(str, i, [')']);
    i = result.endPos;
    part = { type: 'parentheses', expr: result.expr, subexpr: [] };
  }

  // object
  else if (ch === '{') {
    i += 1;
    i = skipWhitespace(str, i);
    if (i >= str.length) {
      throw new ParseError('Expecting closing }', i);
    }
    part = { type: 'object', object: {}, subexpr: [] };
    if (str[i] === '}') {
      i += 1;
    } else {
      while (true) {
        // parse key
        let key: string;
        if (str[i] === "'" || str[i] === '"') {
          const result = parseString(str, i);
          i = result.endPos;
          key = result.str;
        } else if (validVarChar(str[i]) && !isNum(str[i])) {
          const result = parseVar(str, i);
          i = result.endPos;
          key = result.str;
        } else {
          throw new ParseError('Bad char', i);
        }
        part.object[key] = [];

        //
        i = skipWhitespace(str, i);
        if (i >= str.length) {
          throw new ParseError('Unexpected end of object. Missing }', i);
        }

        // has value?
        if (str[i] === ':') {
          i += 1;
          i = skipWhitespace(str, i);
          const result2 = parseImpl(str, i, ['}', ',']);
          if (result2.expr.length === 0 || result2.endPos === i) {
            throw new ParseError('Expected expression', i);
          }
          part.object[key] = result2.expr;
          i = result2.endPos - 1;
        }

        if (str[i] === '}') {
          i += 1;
          break;
        }
        if (str[i] === ',') {
          i += 1;
          i = skipWhitespace(str, i);
          if (i >= str.length) {
            throw new ParseError(
              'Unexpected end of object. Missing next key',
              i,
            );
          }
        } else {
          ch = str[i];
          throw new ParseError(`Bad char ${ch}`, i);
        }
      }
    }
  }

  // number
  else if (isNum(ch)) {
    const result = parseNum(str, i);
    part = { type: 'number', number: result.number, subexpr: [] };
    i = result.endPos;
  }

  // operator
  else if (extractOperator(str, i)) {
    const opr = extractOperator(str, i) as TOperators;
    part = { type: 'operator', name: opr, position: i };
    i += opr.length;
  }

  //
  else {
    throw new ParseError(`Bad character: ${ch}`, i);
  }

  // sub-expr
  if (part.type !== 'operator') {
    i = skipWhitespace(str, i);
    const result2 = parseSubexpr(str, i);
    part.subexpr = result2.expr;
    i = result2.endPos;
  }

  return { part, endPos: i };
}

interface IParseSubexprRes {
  expr: TSubExpr[];
  endPos: number;
}
export function parseSubexpr(str: string, i: number): IParseSubexprRes {
  const expr: TSubExpr[] = [];
  while (i < str.length) {
    if (str[i] === '.') {
      i += 1;
      i = skipWhitespace(str, i);
      const part: TSubExpr_variable = {
        type: 'variable',
        name: '',
        position: i,
      };
      const result = parseVar(str, i);
      i = skipWhitespace(str, result.endPos);
      part.name = result.str;
      expr.push(part);
    }
    //
    else if (str[i] === '[') {
      i += 1;
      i = skipWhitespace(str, i);
      const part: TSubExpr_variable_dyn = {
        type: 'variable_dyn',
        expr: [],
        position: i,
      };
      const result = parseImpl(str, i, [']']);
      part.expr = result.expr;
      if (result.expr.length === 0 || i === result.endPos) {
        throw new ParseError('Empty sub-expr', i);
      }
      i = result.endPos;
      i = skipWhitespace(str, i);
      expr.push(part);
    }
    //
    else if (str[i] === '(') {
      // function
      const result = parseArgs(str, i);
      const part: TSubExpr_function = {
        type: 'function',
        arguments: result.args,
        position: i,
      };
      i = skipWhitespace(str, result.endPos);
      expr.push(part);
    }
    //
    else {
      break;
    }
  }
  return { expr, endPos: i };
}

interface IParseRes {
  expr: TExpr[];
  endPos: number;
}
export function parseImpl(str: string, i: number, endCh: string[]): IParseRes {
  const expr: TExpr[] = [];

  i = skipWhitespace(str, i);

  // add number 0 if expression starts with operator -
  if (i < str.length && str[i] === '-') {
    expr.push({ type: 'number', number: 0, subexpr: [] });
  }

  while (true) {
    if (i >= str.length) {
      if (endCh.length > 0) {
        throw new ParseError('End of expression', i);
      }
      break;
    }
    if (endCh.indexOf(str[i]) !== -1) {
      i += 1;
      break;
    }
    const result = parsePart(str, i);
    expr.push(result.part);
    i = skipWhitespace(str, result.endPos);
  }

  return { expr, endPos: i };
}

export default function parse(str: string): TExpr[] {
  const result = parseImpl(str, 0, []);
  return result.expr;
}
