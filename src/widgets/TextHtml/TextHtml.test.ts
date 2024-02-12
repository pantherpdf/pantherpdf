/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { TextHtmlData, TextHtmlCompiled } from './TextHtml';
import {
  ReportForceWidgets,
  compileComponentTest,
  renderWidget,
} from '../../unitTestHelpers';
import renderToHtml from '../../data/renderToHtml';
import { sampleReport } from '../../editor/sampleReport';
import { defaultWidgets } from '../allWidgets';
import { extractTag, valueInternalFromEditor } from './internalRepresentation';
import { ApiEndpoints } from '../../types';
import { googleFontCssUrl } from '../GoogleFonts';
import compile from '../../data/compile';

test('parse TextHtml formula', async () => {
  const html = `aaa
<div>a<b style="color:white">b</b>c</div>
d<b id="&quot;">ef</b> <data data-adjust="123&gt;4"><i></i><b>d</b>ata.def</data><br/>
<div>ghi</div>
<p></p>`;

  const arr = valueInternalFromEditor(html);
  expect((arr[0] as any).value).toBe(`aaa
<div>a<b style="color:white">b</b>c</div>
d<b id="&quot;">ef</b> <b>`);
  expect((arr[1] as any).formula).toBe('data.def');
  expect((arr[1] as any).adjust).toBe('123>4');
  expect((arr[2] as any).value).toBe(`</b><br/>
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
    value: valueInternalFromEditor('Hello <data><i></i><b>data.txt</b></data>'),
    children: [],
    font: {},
  };
  const data = { txt: '123' };
  const p2 = await compileComponentTest(dt, data);
  expect(p2).toBeTruthy();
  expect(p2.type).toBe('TextHtml');
  const p = p2 as TextHtmlCompiled;
  expect(p.value).toBe('Hello <b>123</b>');
});

test('TextHtml Filter', async () => {
  const dt: TextHtmlData = {
    type: 'TextHtml',
    value: valueInternalFromEditor(
      'Hello <data data-adjust="num, 2 dec">data.num</data>',
    ),
    children: [],
    font: {},
  };
  const data = { num: 123.123456789 };
  const p2 = await compileComponentTest(dt, data);
  expect(p2).toBeTruthy();
  expect(p2.type).toBe('TextHtml');
  const p = p2 as TextHtmlCompiled;
  expect(p.value).toBe('Hello 123.12');
});

test('TextHtml should render html', async () => {
  const dt: TextHtmlData = {
    type: 'TextHtml',
    value: valueInternalFromEditor('Hello <b>world</b>'),
    children: [],
    font: { size: '20px' },
  };
  const html = await renderWidget(dt);
  expect(html).toMatchSnapshot();
});

test('TextHtml should include google font', async () => {
  const report: ReportForceWidgets<TextHtmlData> = {
    ...sampleReport,
    widgets: [
      {
        type: 'TextHtml',
        value: valueInternalFromEditor('text'),
        children: [],
        font: { size: '20px', family: 'Lato' },
      },
    ],
  };
  const api: ApiEndpoints = {
    fonts: {
      list: [],
      getCssUrls: arr => {
        const url = googleFontCssUrl(arr);
        return url ? [url] : [];
      },
    },
  };
  const compiled = await compile(report, {}, defaultWidgets, api);
  const html = renderToHtml(compiled, defaultWidgets, api);
  expect(html).toContain(
    'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400&display=swap',
  );
});
