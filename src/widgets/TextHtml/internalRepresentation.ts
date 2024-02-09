/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import { FormulaObject } from '../../types';
import { Element_, parse, extractText } from '../HtmlParser';
import { escapeHtml } from './helpers';
import { tagType } from './options';

export type ValueHtml = { type: 'html'; value: string };
export type ValueFormula = FormulaObject & { type: 'formula'; adjust?: string };
export type TextHtmlDataValue = ValueHtml | ValueFormula;

export function valueInternalToEditor(value: TextHtmlDataValue[]): string {
  let html = '';
  for (const part of value) {
    const type = part.type;
    switch (type) {
      case 'html': {
        html += part.value;
        break;
      }
      case 'formula': {
        html += `<${tagType}`;
        if (part.adjust) {
          html += ` data-adjust="${escapeHtml(part.adjust)}"`;
        }
        html += `>${escapeHtml(part.formula)}</${tagType}>`;
        break;
      }
      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`Unknown data type: ${exhaustiveCheck}`);
      }
    }
  }
  return html;
}

export function extractTag(html: string) {
  function process(el: Element_): Element_[] {
    for (const el2 of el.children) {
      if (el2.name === '#text' && el2.textContent.trim().length > 0) {
        return [el];
      }
      const sub = process(el2);
      if (sub.length > 0) {
        return [el, ...sub];
      }
    }
    return [];
  }

  const r = parse(html);
  if (r.length !== 1) {
    throw new Error('Bad element');
  }
  const adjust = r[0].attributes['data-adjust'] || '';

  const tags2 = process(r[0]);
  if (tags2.length > 0) {
    // remove el
    tags2.splice(0, 1);
  }
  const tags = tags2.map(el => ({ name: el.name, attributes: el.attributes }));
  return {
    formula: extractText(r[0]),
    adjust: adjust || undefined,
    tags,
  };
}

export function valueInternalFromEditor(html: string): TextHtmlDataValue[] {
  if (html.indexOf('<!--') !== -1) {
    throw new Error('Comments not supported');
  }
  const arr: TextHtmlDataValue[] = [];
  const tagStart = '<' + tagType;
  const tagEnd = '</' + tagType + '>';
  let i = 0;
  while (i < html.length) {
    const i2 = html.indexOf(tagStart, i);
    if (i2 === -1) {
      break;
    }
    const i3 = html.indexOf(tagEnd, i2);
    if (i3 === -1) {
      break;
    }
    const html2 = html.substring(i, i2);
    if (html2.length > 0) {
      const lastVal = getOrAddHtmlValue(arr);
      lastVal.value += html2;
    }
    const { formula, adjust, tags } = extractTag(
      html.substring(i2, i3 + tagEnd.length),
    );
    if (
      tags.length > 0 &&
      (arr.length === 0 || arr[arr.length - 1].type !== 'html')
    ) {
      arr.push({ type: 'html', value: '' });
    }
    const lastVal = getOrAddHtmlValue(arr);
    for (const tag of tags) {
      lastVal.value += `<${tag.name}`;
      for (const [key, value] of Object.entries(tag.attributes)) {
        lastVal.value += ` ${key}`;
        if (value !== undefined) {
          lastVal.value += `="${escapeHtml(value)}"`;
        }
      }
      lastVal.value += `>`;
    }
    if (formula.length > 0) {
      arr.push({ type: 'formula', formula, adjust });
    }
    if (tags.length > 0) {
      const val: TextHtmlDataValue = { type: 'html', value: '' };
      for (const tag of [...tags].reverse()) {
        val.value += `</${tag.name}>`;
      }
      arr.push(val);
    }
    i = i3 + tagEnd.length;
  }
  if (i < html.length) {
    const lastVal = getOrAddHtmlValue(arr);
    lastVal.value += html.substring(i);
  }
  return arr;
}

function getOrAddHtmlValue(arr: TextHtmlDataValue[]): ValueHtml {
  if (arr.length > 0 && arr[arr.length - 1].type === 'html') {
    return arr[arr.length - 1] as ValueHtml;
  }
  const lastVal: ValueHtml = { type: 'html', value: '' };
  arr.push(lastVal);
  return lastVal;
}
