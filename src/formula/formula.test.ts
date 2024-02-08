/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import formulaEvaluate from './formula';
import type { IHelpers } from './types';

test('whitespace', async () => {
  await expect(formulaEvaluate(' ')).resolves.toBe(undefined);
  await expect(formulaEvaluate('1+2')).resolves.toBe(3);
  await expect(formulaEvaluate(' 1 + 2 ')).resolves.toBe(3);
  await expect(formulaEvaluate(' 1 +\n2 ')).resolves.toBe(3);
  await expect(formulaEvaluate(' 1 + 2 \n*\n2')).resolves.toBe(5);
  await expect(formulaEvaluate(' 1\t+ 2 \n*\n2\t2\r')).rejects.toThrow();
  await expect(formulaEvaluate('3?*2')).rejects.toThrow();
});

test('simple cases', async () => {
  await expect(formulaEvaluate('1+2')).resolves.toBe(3);
  await expect(formulaEvaluate('2*(4+2)')).resolves.toBe(12);

  await expect(formulaEvaluate('[  ]')).resolves.toStrictEqual([]);
  await expect(formulaEvaluate('[ 1, 2 ]')).resolves.toStrictEqual([1, 2]);
  await expect(formulaEvaluate('[ 1, ]')).rejects.toThrow();
  await expect(formulaEvaluate('[ , 1 ]')).rejects.toThrow();

  await expect(formulaEvaluate('"ab, cd \'"')).resolves.toStrictEqual(
    "ab, cd '",
  );

  await expect(formulaEvaluate('"abc def')).rejects.toThrow();
  await expect(formulaEvaluate('"abc def \\')).rejects.toThrow();
  await expect(formulaEvaluate('"abc def \\"')).rejects.toThrow();

  await expect(formulaEvaluate('{ }')).resolves.toStrictEqual({});
  await expect(formulaEvaluate('{')).rejects.toThrow();
  await expect(formulaEvaluate('  }')).rejects.toThrow();
  await expect(formulaEvaluate('     ')).resolves.toBe(undefined);
  await expect(formulaEvaluate('{ a }')).resolves.toStrictEqual({
    a: undefined,
  });
  await expect(formulaEvaluate('{a,}')).rejects.toThrow();
  await expect(formulaEvaluate("{'1\\'2': 123 }")).resolves.toStrictEqual({
    "1'2": 123,
  });
  await expect(formulaEvaluate('{ abc: 123}')).resolves.toStrictEqual({
    abc: 123,
  });
  await expect(formulaEvaluate('{1abc: 123}')).rejects.toThrow();
});

test('number operators', async () => {
  await expect(formulaEvaluate('3+5')).resolves.toBe(8);
  await expect(formulaEvaluate('3-5')).resolves.toBe(-2);
  await expect(formulaEvaluate('3*5')).resolves.toBe(15);
  await expect(formulaEvaluate('3/5')).resolves.toBe(0.6);
  await expect(formulaEvaluate('3%5')).rejects.toThrow();
  await expect(formulaEvaluate('3^5')).resolves.toBe(243);
  await expect(formulaEvaluate('3+-5')).rejects.toThrow();
});

test('string operators', async () => {
  await expect(formulaEvaluate('"abc"  +"defž"')).resolves.toBe('abcdefž');
  await expect(formulaEvaluate('"abc"  + 15')).resolves.toBe('abc15');
  await expect(formulaEvaluate('"abc"  + [1,2,3]')).resolves.toBe('abc1,2,3');
  await expect(formulaEvaluate('"abc"  + null + 1 + 2')).resolves.toBe(
    'abcnull12',
  );
});

test('array operators', async () => {
  await expect(formulaEvaluate('[1,2] + "abc"')).rejects.toThrow();
  await expect(formulaEvaluate('[1,2] + [3,4]')).resolves.toStrictEqual([
    1, 2, 3, 4,
  ]);
});

test('object operators', async () => {
  await expect(formulaEvaluate('{a:1} + "abc"')).rejects.toThrow();
});

test('logical operators', async () => {
  await expect(formulaEvaluate('1 == 1')).resolves.toBe(true);
  await expect(formulaEvaluate('1 == 2')).resolves.toBe(false);
  await expect(formulaEvaluate('3 > 5')).resolves.toBe(false);
  await expect(formulaEvaluate('3 >= 5')).resolves.toBe(false);
  await expect(formulaEvaluate('3 >= 3')).resolves.toBe(true);
  await expect(formulaEvaluate('3 < 5')).resolves.toBe(true);
  await expect(formulaEvaluate('3 <= 5')).resolves.toBe(true);

  await expect(formulaEvaluate('("ab"+"c") == ("a"+"bc")')).resolves.toBe(true);
  await expect(formulaEvaluate('("ab"+"c") == ("a"+"bc2")')).resolves.toBe(
    false,
  );
  await expect(formulaEvaluate('1 == "1"')).resolves.toBe(false);
  await expect(formulaEvaluate('3 && 5')).resolves.toBe(5);
  await expect(formulaEvaluate('3 || 5')).resolves.toBe(3);
  await expect(formulaEvaluate('true && 2')).resolves.toBe(2);
  await expect(formulaEvaluate('[] && 2')).resolves.toBe(2);
  await expect(formulaEvaluate('0 && 2')).resolves.toBe(0);
  await expect(formulaEvaluate('2*3 == 3*2')).resolves.toBe(true);
});

test('deep object compare', async () => {
  await expect(formulaEvaluate('[1,2] == [1,3]')).resolves.toBe(false);
  await expect(formulaEvaluate('[1,2] == [1,2]')).resolves.toBe(true);
  await expect(formulaEvaluate('{a:1} == {a:1}')).resolves.toBe(true);
  await expect(formulaEvaluate('{a:1,b:2} == {b:2,a:1}')).resolves.toBe(true);
  await expect(formulaEvaluate('{a:1,b:2} != {b:2,a:1}')).resolves.toBe(false);
  await expect(formulaEvaluate('{} == []')).resolves.toBe(false);
});

test('built-in functions', async () => {
  await expect(formulaEvaluate('pow(3,5)')).resolves.toBe(243);

  await expect(formulaEvaluate('not(3)')).resolves.toBe(false);
  await expect(formulaEvaluate('not(false)')).resolves.toBe(true);

  await expect(formulaEvaluate('columnName(5)')).resolves.toBe('E');
  await expect(formulaEvaluate('columnName("5")')).rejects.toThrow();

  await expect(formulaEvaluate('inArray([1,2], 1)')).resolves.toBe(true);
  await expect(formulaEvaluate('inArray([1,2], 3)')).resolves.toBe(false);
  await expect(formulaEvaluate('inArray({a:1}, 1)')).rejects.toThrow();

  await expect(formulaEvaluate('arrayIndexOf([1,2,3], 2)')).resolves.toBe(1);
  await expect(formulaEvaluate('arrayIndexOf({a:1}, 1)')).rejects.toThrow();

  await expect(formulaEvaluate('string(2)')).resolves.toBe('2');
  await expect(formulaEvaluate('str([1,2])')).resolves.toBe('1,2');

  await expect(formulaEvaluate('substr("12345", 1)')).resolves.toBe('2345');
  await expect(formulaEvaluate('substr("12345", 1, 4)')).resolves.toBe('234');
  await expect(formulaEvaluate('substr(null, 1, 4)')).rejects.toThrow();
  await expect(formulaEvaluate('substr(null, 1)')).rejects.toThrow();
  await expect(formulaEvaluate('substring("12345", 1, 4)')).resolves.toBe(
    '234',
  );

  await expect(formulaEvaluate('lower([1,2])')).rejects.toThrow();
  await expect(formulaEvaluate('toLowerCase([1,2])')).rejects.toThrow();
  await expect(formulaEvaluate('upper([1,2])')).rejects.toThrow();
  await expect(formulaEvaluate('toUpperCase([1,2])')).rejects.toThrow();
  await expect(formulaEvaluate('lower("aAbbCC")')).resolves.toBe('aabbcc');
  await expect(formulaEvaluate('toLowerCase("aAbbCC")')).resolves.toBe(
    'aabbcc',
  );
  await expect(formulaEvaluate('upper("aAbbCC")')).resolves.toBe('AABBCC');
  await expect(formulaEvaluate('toUpperCase("aAbbCC")')).resolves.toBe(
    'AABBCC',
  );
});

test('build-in date functions', async () => {
  const r1 = (await formulaEvaluate('now()')) as any;
  expect(typeof r1).toBe('string');
  expect(r1.length).toBe(20);
  expect(r1.toLowerCase() === r1).toBe(false);
  expect(r1.toUpperCase() === r1).toBe(true);
  const rgx = /^[\d]{4}-[\d]{2}-[\d]{2}T[\d]{2}:[\d]{2}:[\d]{2}Z$/gm;
  expect(r1.match(rgx)).toBeTruthy();
});

test('buildin constants', async () => {
  await expect(formulaEvaluate('false')).resolves.toBe(false);
  await expect(formulaEvaluate('true')).resolves.toBe(true);
  await expect(formulaEvaluate('null')).resolves.toBe(null);
  await expect(() => formulaEvaluate('non_exsistent')).rejects.toThrow();
});

test('property access', async () => {
  await expect(formulaEvaluate('{a:[1]}.a')).resolves.toStrictEqual([1]);
  await expect(formulaEvaluate('{a:[1,2,3]} . a  [2]')).resolves.toBe(3);
  await expect(formulaEvaluate('{a:[1,2,3]} . a  [0*5+1]')).resolves.toBe(2);
  await expect(formulaEvaluate('null [1]')).rejects.toThrow();
  await expect(formulaEvaluate('[1,2,3][1]')).resolves.toBe(2);
  await expect(formulaEvaluate('[1,2,3][1](2)')).rejects.toThrow();
});

test('hide access to buildin properties like __proto__', async () => {
  await expect(formulaEvaluate('{a:1}.__proto__')).resolves.toBe(undefined);
  await expect(formulaEvaluate('{a:1}.__defineGetter__')).resolves.toBe(
    undefined,
  );
});

test('custom variable function getVar()', async () => {
  const data = { abc: 10 };
  const helper: IHelpers = {
    getVar: (name: string) => {
      if (name === 'data') {
        return data;
      }
      return undefined;
    },
  };
  await expect(formulaEvaluate('data.abc', helper)).resolves.toBe(10);
});

test('resolve promise of a property', async () => {
  const prms = new Promise(resolve => {
    resolve({ a: 5 });
  });
  const data = { prms };
  const helper: IHelpers = {
    getVar: (name: string) => {
      if (name === 'data') {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(data);
          }, 50);
        });
      }
      return undefined;
    },
  };
  await expect(formulaEvaluate('data.prms.a', helper)).resolves.toBe(5);
});

test('custom functions', async () => {
  const data = {
    func: (a: any) => a * 2,
    funcErr: () => {
      throw new Error('my custom error');
    },
  };
  const helper: IHelpers = {
    getVar: (name: string) => {
      if (name === 'data') {
        return data;
      }
      return undefined;
    },
  };
  await expect(formulaEvaluate('data.func(10)', helper)).resolves.toBe(20);
  await expect(formulaEvaluate('data.funcErr()', helper)).rejects.toThrow(
    'my custom error',
  );
});

test('buildin properties', async () => {
  await expect(formulaEvaluate('[ 1, 2 ].join("x")')).resolves.toStrictEqual(
    '1x2',
  );
  await expect(formulaEvaluate('[ 1, 2 ].length')).resolves.toStrictEqual(2);
  await expect(
    formulaEvaluate('[ 1, 2, 3, 4, 5, 6, 7, 8 ].slice(1, 3)'),
  ).resolves.toStrictEqual([2, 3]);
  await expect(formulaEvaluate('"abc-def".length')).resolves.toStrictEqual(7);
  await expect(
    formulaEvaluate('"abc-def".substring(2,5)'),
  ).resolves.toStrictEqual('c-d');
  await expect(
    formulaEvaluate(
      '"The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?".replaceAll("dog", "monkey")',
    ),
  ).resolves.toStrictEqual(
    'The quick brown fox jumps over the lazy monkey. If the monkey reacted, was it really lazy?',
  );
  await expect(formulaEvaluate('"abc aa".replace("a", "x")')).rejects.toThrow();
});

test('class member function', async () => {
  class Person {
    public name: string;
    constructor(name: string) {
      this.name = name;
    }
  }
  class Employee extends Person {
    public job: string;
    constructor(name: string, job: string) {
      super(name);
      this.job = job;
    }
    public GetJobUppercase(): string {
      return this.job.toUpperCase();
    }
  }
  const obj = new Employee('Alice', 'Iceberg mover');
  const helper: IHelpers = {
    getVar: (name: string) => {
      if (name === 'data') {
        return obj;
      }
      return undefined;
    },
  };
  await expect(formulaEvaluate('data.GetJobUppercase()', helper)).resolves.toBe(
    'ICEBERG MOVER',
  );
});
