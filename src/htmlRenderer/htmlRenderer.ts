/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 * @description Render JSX to a html string.
 *
 *  Using custom renderer because we cannot use default renderer with NextJS.
 * See: https://github.com/vercel/next.js/discussions/58533
 *
 * Notes:
 * - MathML is not supported because React also doesn't support it by default
 * - Hook calls are not supported
 * - portal is not supported
 */

import React, { ReactPortal } from 'react';
import styleToCssString from './react-style-object-to-css/react-style-object-to-css';

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// https://www.w3.org/TR/2011/WD-html-markup-20110113/syntax.html
const htmlVoidEelements = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

const svgVoidElements = [
  'circle',
  'clipPath',
  'defs',
  'ellipse',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'filter',
  'foreignObject',
  'line',
  'linearGradient',
  'marker',
  'mask',
  'metadata',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'stop',
  'svg',
  'switch',
  'symbol',
  'textPath',
  'title',
  'use',
];

const attrMapping: { [key: string]: string } = {
  htmlFor: 'for',
  className: 'class',
  defaultChecked: 'checked',
  defaultValue: 'selected',
  maxLength: 'maxlength',
  minLength: 'minlength',
  readOnly: 'readonly',
  referrerPolicy: 'referrerpolicy',
  spellCheck: 'spellcheck',
  tabIndex: 'tabindex',
  contentEditable: 'contenteditable',
};

const attrIgnore = ['dangerouslySetInnerHTML', 'children', 'ref', 'key'];

function prepareAttribute(key: string, value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  if (attrIgnore.indexOf(key) !== -1) {
    return '';
  }
  const differentName = attrMapping[key];
  if (differentName) {
    key = differentName;
  }
  // Do not change to lower case. SVG have mixed case attributes.
  if (key === 'style') {
    if (typeof value !== 'object' || !value) {
      throw new Error('Bad style');
    }
    if (Object.keys(value).length === 0) {
      return '';
    }
    const txt = styleToCssString(value);
    return `style="${escapeHtml(txt)}"`;
  }
  return `${key}="${escapeHtml(String(value))}"`;
}

function renderNativeElement(el: React.ReactElement<any, string>): string {
  const tp = el.type;
  // children
  let children = '';
  if (el.props.dangerouslySetInnerHTML) {
    children = el.props.dangerouslySetInnerHTML.__html;
  } else if (!el.props.children) {
    // ignore
  } else {
    // string, array, object
    children = renderReactNodeToHtmlString(el.props.children);
  }
  // attributes
  let attr = Object.keys(el.props)
    .map(key => prepareAttribute(key, el.props[key]))
    .filter(x => !!x)
    .join(' ');
  if (attr.length > 0) {
    attr = ' ' + attr;
  }
  // void element
  if (children.length === 0 && htmlVoidEelements.indexOf(tp) !== -1) {
    // Trailing / not allowed
    return `<${tp}${attr}>`;
  }
  if (children.length === 0 && svgVoidElements.indexOf(tp) !== -1) {
    // Trailing / is required
    return `<${tp}${attr} />`;
  }
  // normal element
  return `<${tp}${attr}>${children}</${tp}>`;
}

function isIterable(val: any): val is Iterable<unknown> {
  if (val == null) {
    return false;
  }
  return typeof val[Symbol.iterator] === 'function';
}

function isPortal(val: any): val is ReactPortal {
  return (
    typeof val === 'object' &&
    !!val &&
    val.$$typeof === Symbol.for('react.portal')
  );
}

function isStringReactElement(
  val: React.ReactElement<any, string | React.JSXElementConstructor<any>>,
): val is React.ReactElement<any, string> {
  return typeof val.type === 'string';
}

export default function renderReactNodeToHtmlString(
  el: React.ReactNode,
): string {
  if (typeof el === 'boolean' || el === null || el === undefined) {
    return '';
  }
  if (typeof el === 'number') {
    return String(el);
  }
  if (typeof el === 'string') {
    return escapeHtml(el);
  }
  if (isIterable(el)) {
    return Array.from(el)
      .map(el2 => renderReactNodeToHtmlString(el2))
      .join('');
  }
  if (isPortal(el)) {
    throw new Error('Portal not supported');
  }
  if (isStringReactElement(el)) {
    return renderNativeElement(el);
  }
  const type = el.type;
  if (type === React.Fragment) {
    return renderReactNodeToHtmlString(el.props.children);
  }
  if (typeof type === 'function') {
    const funcOrClass = type as any;
    if (/^\s*class\s+/.test(funcOrClass.toString())) {
      // class component
      const el2 = new funcOrClass(el.props);
      return renderReactNodeToHtmlString(el2.render());
    }
    // functional component
    const el2 = funcOrClass(el.props);
    return renderReactNodeToHtmlString(el2);
  }
  throw new Error(`Unsupported type ${typeof type}`);
}
