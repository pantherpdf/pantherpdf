/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import React, { CSSProperties } from 'react';
import render from './htmlRenderer';

test('string', () => {
  expect(render('hello world')).toBe('hello world');
  expect(render('hello < world')).toBe('hello &lt; world');
});

test('number', () => {
  expect(render(1)).toBe('1');
  expect(render(-123.456)).toBe('-123.456');
});

test('null, undefined, boolean', () => {
  expect(render(null)).toBe('');
  expect(render(undefined)).toBe('');
  expect(render(false)).toBe('');
  expect(render(true)).toBe('');
});

test('simple div', () => {
  expect(render(<div>hello world</div>)).toBe('<div>hello world</div>');
});

test('array', () => {
  const arr = [
    <div key={'A'}>item A</div>,
    <div key={'B'}>item B</div>,
    <div key={'C'}>item C</div>,
  ];
  expect(render(arr)).toBe(
    '<div>item A</div><div>item B</div><div>item C</div>',
  );
});

test('fragment', () => {
  expect(
    render(
      <>
        <div>A</div>
        <p>B</p>C
      </>,
    ),
  ).toBe('<div>A</div><p>B</p>C');
});

test('functional', () => {
  function FuncComponentInner(props: any) {
    return <div>{props.children}</div>;
  }
  function FuncComponentOutter() {
    return (
      <FuncComponentInner>
        hello <strong>world</strong>
      </FuncComponentInner>
    );
  }
  expect(render(<FuncComponentOutter />)).toBe(
    '<div>hello <strong>world</strong></div>',
  );
});

test('class component', () => {
  class Abc extends React.Component<{}, { num: number }> {
    constructor(props: {}) {
      super(props);
      this.state = { num: 123 };
    }
    render(): React.ReactNode {
      return <div>YES {this.state.num}</div>;
    }
  }
  expect(render(<Abc />)).toBe('<div>YES 123</div>');
});

test('set inner html', () => {
  expect(
    render(
      <div
        dangerouslySetInnerHTML={{ __html: '<strong>hello</strong world' }}
      />,
    ),
  ).toBe('<div><strong>hello</strong world</div>');
});

test('inline style', () => {
  expect(
    render(<div style={{ fontWeight: 'bold', color: 'red' }}>abc</div>),
  ).toBe('<div style="font-weight:bold;color:red">abc</div>');
});

test('useless style', () => {
  function FuncComp(props: { style: object }) {
    return <pre>{JSON.stringify(props.style, undefined, 2)}</pre>;
  }
  expect(render(<FuncComp style={{ fontWeight: 'bold' }} />)).toBe(
    `<pre>{
  &quot;fontWeight&quot;: &quot;bold&quot;
}</pre>`,
  );
});

test('pass down style', () => {
  function FuncComp(props: { style: CSSProperties }) {
    return <span style={props.style}>123</span>;
  }
  expect(render(<FuncComp style={{ fontWeight: 'bold' }} />)).toBe(
    '<span style="font-weight:bold">123</span>',
  );
});

test('empty style', () => {
  expect(render(<div style={{}}>abc</div>)).toBe('<div>abc</div>');
});

test('style with string', () => {
  expect(render(<div style={{ content: `⛅    '"   ;    🎮   ` }} />)).toBe(
    `<div style="content:&#039;⛅    \\&#039;&quot;   ;    🎮   &#039;"></div>`,
  );
  expect(
    render(
      <div style={{ backgroundImage: `url("paper  with  spa\nces\ta ")` }} />,
    ),
  ).toBe(
    `<div style="background-image:url(&quot;paper  with  spa\nces\ta &quot;)"></div>`,
  );
});

test('attributes', () => {
  expect(render(<div data-abc="123<456" />)).toBe(
    '<div data-abc="123&lt;456"></div>',
  );
  expect(render(<label htmlFor="abc">abc</label>)).toBe(
    '<label for="abc">abc</label>',
  );
  expect(render(<div className="my-class" />)).toBe(
    '<div class="my-class"></div>',
  );
});

test('break line', () => {
  expect(
    render(
      <div>
        abc
        <br />
        def
      </div>,
    ),
  ).toBe('<div>abc<br>def</div>');
});

test('svg', () => {
  expect(
    render(
      <div>
        <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="37.03"
            y="43.969"
            width="420.811"
            height="419.344"
            style={{ fill: 'rgb(216, 216, 216)', stroke: 'rgb(0, 0, 0)' }}
          />
        </svg>
      </div>,
    ),
  ).toBe(
    '<div><svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"><rect x="37.03" y="43.969" width="420.811" height="419.344" style="fill:rgb(216, 216, 216);stroke:rgb(0, 0, 0)" /></svg></div>',
  );
});

test('upper case', () => {
  const el = React.createElement('DIV', {}, 'abc');
  expect(render(el)).toBe('<DIV>abc</DIV>');
});

test('attribute undefined', () => {
  expect(render(<div contentEditable={undefined} />)).toBe('<div></div>');
});
