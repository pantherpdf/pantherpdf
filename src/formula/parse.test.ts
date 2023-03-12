/**
 * @jest-environment node
 */

import parse, {
  isWhiteSpace,
  skipWhitespace,
  isNum,
  isAl,
  validVarChar,
  isOperatorTypeGuard,
  extractOperator,
  parseArgs,
  parsePart,
  parseString,
  parseVar,
  parseImpl,
  parseNum,
} from './parse';
import { TExpr, TExpr_object } from './types';

function extractTypes2(oprs: string[], expr: TExpr[]) {
  expr.map(x => extractType2(oprs, x));
}
function extractType2(oprs: string[], expr: TExpr) {
  oprs.push(expr.type);
  if (expr.type === 'array') {
    expr.arguments.map(expr2 => extractTypes2(oprs, expr2));
  } else if (expr.type === 'object') {
    Object.values(expr.object).map(expr2 => extractTypes2(oprs, expr2));
  } else if (expr.type === 'parentheses') {
    extractTypes2(oprs, expr.expr);
  }
  if (expr.type !== 'operator') {
    for (const sub of expr.subexpr) {
      oprs.push(sub.type);
      if (sub.type === 'function') {
        sub.arguments.map(expr2 => extractTypes2(oprs, expr2));
      } else if (sub.type === 'variable_dyn') {
        extractTypes2(oprs, sub.expr);
      }
    }
  }
}
function extractTypes(expr: TExpr[]): string[] {
  let arr: string[] = [];
  extractTypes2(arr, expr);
  return arr;
}

test('whitespace', () => {
  expect(() => isWhiteSpace('  ')).toThrow();
  expect(() => isWhiteSpace('')).toThrow();
  expect(isWhiteSpace(' ')).toBe(true);
  expect(isWhiteSpace('\t')).toBe(true);
  expect(isWhiteSpace('\n')).toBe(true);
  expect(isWhiteSpace('\u00A0')).toBe(true);
  expect(isWhiteSpace('\r')).toBe(true);
  expect(isWhiteSpace('_')).toBe(false);
});

test('skipWhitespace', () => {
  const str1 = 'banana ananas   elephant';
  expect(skipWhitespace(str1, 1)).toBe(1);
  expect(() => skipWhitespace(str1, 200)).toThrow();
  expect(skipWhitespace(str1, 13)).toBe(16);
  expect(skipWhitespace(str1, 24)).toBe(24);
});

test('isNum', () => {
  expect(() => isNum('11')).toThrow();
  expect(() => isNum('')).toThrow();
  expect(isNum('1')).toBe(true);
  expect(isNum('9')).toBe(true);
  expect(isNum('a')).toBe(false);
});

test('isAl', () => {
  expect(() => isAl('aa')).toThrow();
  expect(() => isAl('')).toThrow();
  expect(isAl('a')).toBe(true);
  expect(isAl('Z')).toBe(true);
  expect(isAl('1')).toBe(false);
  expect(isAl('_')).toBe(false);
});

test('validVarChar', () => {
  expect(() => validVarChar('aa')).toThrow();
  expect(() => validVarChar('')).toThrow();
  expect(validVarChar('a')).toBe(true);
  expect(validVarChar('Z')).toBe(true);
  expect(validVarChar('1')).toBe(true);
  expect(validVarChar('_')).toBe(true);
  expect(validVarChar('?')).toBe(false);
});

test('isOperatorTypeGuard', () => {
  expect(isOperatorTypeGuard('a')).toBe(false);
  expect(isOperatorTypeGuard('')).toBe(false);
  expect(isOperatorTypeGuard('+')).toBe(true);
  expect(isOperatorTypeGuard('^')).toBe(true);
  expect(isOperatorTypeGuard('.')).toBe(false);
  expect(isOperatorTypeGuard('>=')).toBe(true);
  expect(isOperatorTypeGuard('>=1')).toBe(false);
  expect(isOperatorTypeGuard(true)).toBe(false);
});

test('extractOperator', () => {
  const str2 = '+ abc def / x >=+';
  expect(extractOperator(str2, 0)).toBe('+');
  expect(extractOperator(str2, 4)).toBe(null);
  expect(extractOperator(str2, 14)).toBe('>=');
  expect(extractOperator(str2, 17)).toBe(null);
});

test('parseArgs', () => {
  const str3 = 'abc(1+x, 2*2  ,  5+5,1/1)';
  expect(() => parseArgs(str3, 200)).toThrow();
  expect(() => parseArgs(str3, 0)).toThrow();
  expect(parseArgs(str3, 3).args.length).toBe(4);
  expect(parseArgs(str3, 3).endPos).toBe(25);
  const str4 = 'abc(1+x, 2*2  ,  5+5,1/1';
  expect(() => parseArgs(str4, 3)).toThrow();
  expect(() => parseArgs('(1+1', 0)).toThrow();
  expect(() => parseArgs('', 0)).toThrow();
  expect(() => parseArgs('abc(', 3)).toThrow();
  expect(() => parseArgs('(?', 0)).toThrow();
  expect(() => parseArgs('(1,)', 0)).toThrow();
});

test('parseString', () => {
  expect(() => parseString('abc def', 0)).toThrow();
  expect(() => parseString('"abc def\'', 0)).toThrow();
  expect(parseString('"abc def"', 0).str).toBe('abc def');
  expect(parseString('"abc def" + 123', 0).endPos).toBe(9);
  expect(parseString("'abc def'", 0).str).toBe('abc def');
  expect(() => parseString('`abc def`', 0)).toThrow();
  expect(parseString('"abc\\ndef"', 0).str).toBe('abc\ndef');
  expect(parseString('"abc"', 0).endPos).toBe(5);
  expect(() => parseString('" \\i "', 0)).toThrow();
  expect(() => parseString('" \\', 0)).toThrow();
});

test('parseVar', () => {
  expect(parseVar('abc def', 0).str).toBe('abc');
  expect(() => parseVar('', 0)).toThrow();
  expect(() => parseVar(' abc', 0)).toThrow();
  expect(() => parseVar('abc def', 200)).toThrow();
  expect(parseVar('abc(def', 0).str).toBe('abc');
  expect(parseVar('abc(def', 0).endPos).toBe(3);
  expect(parseVar('abc(def', 4).str).toBe('def');
});

test('parseNum', () => {
  expect(parseNum('123', 0).endPos).toBe(3);
  expect(parseNum('123', 0).number).toBe(123);
  expect(parseNum('123.45', 0).number).toBe(123.45);
  expect(() => parseNum('123.45.45', 0)).toThrow();
  expect(() => parseNum('123.', 0)).toThrow();
  expect(() => parseNum('', 0)).toThrow();
  // prettier-ignore
  expect(() => parseNum('78673821637126736127836128638712637812637812638126472378478394732897489237489237489237894723897482397489234343242342323323323323232636273627183672816378216372678362178637821783721372189738217389273892173891278371289372189378129372819738912738912738912738217389123827189371289378129738129738127372189372819378912738273897', 0)).toThrow();
});

test('parsePart', () => {
  expect(() => parsePart('   ', 1)).toThrow();
  expect(() => parsePart('   "abc" ', 100)).toThrow();
});

// prettier-ignore
test('parse', () => {
  expect(extractTypes(parse('1+1'))).toStrictEqual([ 'number', 'operator', 'number' ]);
  expect(extractTypes(parse(' 1 + 1 '))).toStrictEqual([ 'number', 'operator', 'number' ]);
  expect(extractTypes(parse('-5'))).toStrictEqual([ 'number', 'operator', 'number' ]);
  expect(extractTypes(parse('  -5'))).toStrictEqual([ 'number', 'operator', 'number' ]);
  expect(extractTypes(parse('"abc"'))).toStrictEqual(['string']);
  expect(() => parse('1+1,')).toThrow();
});

// prettier-ignore
test('parseImpl', () => {
  expect(() => parseImpl('1+1  ,', 0, [])).toThrow();
  expect(parseImpl('??? 1+1  ', 3, []).endPos).toBe(9);

  expect(() => parseImpl('1+1  },', 0, [])).toThrow();
  expect(parseImpl('1+1  },', 0, ['}']).endPos).toBe(6);
  expect(() => parseImpl('1+1  ,)', 0, [')'])).toThrow();

  const expr1 = parseImpl('{abc}', 0, []).expr;
  expect(extractTypes(expr1)).toStrictEqual(['object']);
  expect(expr1[0].type).toBe('object');
  const keys1 = Object.keys((expr1[0] as TExpr_object).object);
  expect(keys1).toStrictEqual(['abc']);
  expect(Object.keys((parseImpl('  {   abc   :  123  ,  def  }  ', 0, []).expr[0] as TExpr_object).object))
    .toStrictEqual(['abc', 'def']);
  expect(Object.keys((parseImpl('  {  "abc"  :  123  ,  def  }  ', 0, []).expr[0] as TExpr_object).object))
    .toStrictEqual(['abc', 'def']);
  expect(Object.values((parseImpl('  {  abc  :  123  ,  def  }  ', 0, []).expr[0] as TExpr_object).object))
    .toStrictEqual([[{ type: 'number', number: 123, subexpr: [] }], []]);
  expect(() => parseImpl('{abc:}', 0, [])).toThrow();
  expect(() => parseImpl('{abc:123', 0, [])).toThrow();
  expect(() => parseImpl('{abc,}', 0, [])).toThrow();
  expect(() => parseImpl('{abc ', 0, [])).toThrow();
  expect(() => parseImpl('{abc', 0, [])).toThrow();
  expect(() => parseImpl('{', 0, [])).toThrow();
  expect(() => parseImpl('{abc,', 0, [])).toThrow();
  expect(() => parseImpl('{abc?', 0, [])).toThrow();
  expect(() => parseImpl('abc()["hello"', 0, [])).toThrow();
  expect(() => parseImpl('abc()["hello",', 0, [])).toThrow();
  expect(() => parseImpl('abc()["hello",123]', 0, [])).toThrow();
  expect(() => parse('1+1,')).toThrow();
  expect(() => parse('1+1,2+3')).toThrow();
});

// prettier-ignore
test('subexpr', () => {
  expect(extractTypes([parsePart('a.b', 0).part])).toStrictEqual([ 'variable', 'variable' ]);
  expect(extractTypes([parsePart(' a . b ', 0).part])).toStrictEqual([ 'variable', 'variable' ]);
  expect(() => parse('a . a?')).toThrow();
  expect(() => parsePart('a[]', 0)).toThrow();
});

// prettier-ignore
test('parseImpl including', () => {
  expect(extractTypes(parseImpl('1+1', 0, []).expr)).toStrictEqual([ 'number', 'operator', 'number' ]);
  expect(extractTypes(parseImpl('((1+1)*(-5))/2', 0, []).expr)).toStrictEqual([ 'parentheses', 'parentheses', 'number', 'operator', 'number', 'operator', 'parentheses', 'number', 'operator', 'number', 'operator', 'number' ]);
  expect(extractTypes(parseImpl('"abc"+"def"', 0, []).expr)).toStrictEqual([ 'string', 'operator', 'string' ]);
  expect(extractTypes(parseImpl('abc()[1+1]', 0, []).expr)).toStrictEqual([ 'variable', 'function', 'variable_dyn', 'number', 'operator', 'number' ]);
  expect(extractTypes(parseImpl('[1+1,2,{}]', 0, []).expr)).toStrictEqual([ 'array', 'number', 'operator', 'number', 'number', 'object' ]);
  expect(extractTypes(parseImpl('abc+abc(1)/abc', 0, []).expr)).toStrictEqual([ 'variable', 'operator', 'variable', 'function', 'number', 'operator', 'variable' ]);
  expect(extractTypes(parseImpl('abc+{ k1: [1,2+], "hello": "w", "123"}', 0, []).expr)).toStrictEqual([ 'variable', 'operator', 'object', 'array', 'number', 'number', 'operator', 'string' ]);
});

// prettier-ignore
test('array', () => {
  expect(() => parse('[1,]')).toThrow();
  expect(() => parse('[1')).toThrow();
  expect(() => parse('1,2]')).toThrow();
  expect(extractTypes(parse('[ 1\t,\t2, "abc", {a:[[{}]]}, 1, false]')),).toStrictEqual([ 'array', 'number', 'number', 'string', 'object', 'array', 'array', 'object', 'number', 'variable', ]);
});
