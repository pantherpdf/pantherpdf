/**
 * @jest-environment jsdom
 */

import {
  TextHtmlData,
  TextHtmlCompiled,
  ValueInternalFromEditor,
  extractTag,
} from './TextHtml';
import compile, { compileComponent } from '../editor/compile';
import makeHtml, { makeHtmlContent } from '../editor/makeHtml';
import { ReportForceChildren } from '../editor/types';
import { sampleReport } from '../editor/sampleReport';

test('parse TextHtml formula', async () => {
  const html = `aaa
<div>a<b style="color:white">b</b>c</div>
d<b id="&quot;">ef</b> <data data-adjust="123&gt;4"><i></i><b>d</b>ata.def</data><br/>
<div>ghi</div>
<p></p>`;

  const arr = ValueInternalFromEditor(html);
  expect(arr[0].value).toBe(`aaa
<div>a<b style="color:white">b</b>c</div>
d<b id="&quot;">ef</b> <b>`);
  expect(arr[1].value).toBe('data.def');
  expect((arr[1] as any).adjust).toBe('123>4');
  expect(arr[2].value).toBe(`</b><br/>
<div>ghi</div>
<p></p>`);
});

test('extractTag', () => {
  const { formula, adjust, tags } = extractTag(
    '<data data-adjust="123&gt;8"><i></i><div><i></i><span data-abc="123" def>456</span></div></data>',
  );
  expect(formula).toBe('456');
  expect(adjust).toBe('123>8');
  expect(tags.length).toBe(2);
  expect(tags[0].name).toBe('div');
  expect(tags[1].name).toBe('span');
  expect(tags[1].attributes).toEqual({ 'data-abc': '123', def: undefined });
});

test('TextHtml 2', async () => {
  const dt: TextHtmlData = {
    type: 'TextHtml',
    value: ValueInternalFromEditor('Hello <data><i></i><b>data.txt</b></data>'),
    children: [],
    font: {},
  };
  const data = { txt: '123' };
  const p2 = await compileComponent(dt, data);
  expect(p2).toBeTruthy();
  expect(p2.type).toBe('TextHtml');
  const p = p2 as TextHtmlCompiled;
  expect(p.value).toBe('Hello <b>123</b>');
});

test('TextHtml Filter', async () => {
  const dt: TextHtmlData = {
    type: 'TextHtml',
    value: ValueInternalFromEditor(
      'Hello <data data-adjust="num, 2 dec">data.num</data>',
    ),
    children: [],
    font: {},
  };
  const data = { num: 123.123456789 };
  const p2 = await compileComponent(dt, data);
  expect(p2).toBeTruthy();
  expect(p2.type).toBe('TextHtml');
  const p = p2 as TextHtmlCompiled;
  expect(p.value).toBe('Hello 123.12');
});

test('TextHtml should render html', async () => {
  const report: ReportForceChildren<TextHtmlData> = {
    ...sampleReport,
    children: [
      {
        type: 'TextHtml',
        value: ValueInternalFromEditor('Hello <b>world</b>'),
        children: [],
        font: { size: '20px' },
      },
    ],
  };
  const compiled = await compile(report, {});
  const html = makeHtmlContent(compiled);
  expect(html).toMatchSnapshot();
});

test('TextHtml should include google font', async () => {
  const report: ReportForceChildren<TextHtmlData> = {
    ...sampleReport,
    children: [
      {
        type: 'TextHtml',
        value: ValueInternalFromEditor('text'),
        children: [],
        font: { size: '20px', family: 'Lato' },
      },
    ],
  };
  const compiled = await compile(report, {});
  const html = makeHtml(compiled);
  expect(html).toContain(
    'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400&display=swap',
  );
});
