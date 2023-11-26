/**
 * @project https://github.com/Calvin92/react-style-object-to-css
 * @copyright 2018 Calvin, 2023 Ignac Banic
 * @license MIT
 */

import type { CSSProperties } from 'react';

import { isUnitlessNumber } from './CSSProperty';
import hyphenateStyleName from './hyphenateStyleName';

// Follows syntax at https://developer.mozilla.org/en-US/docs/Web/CSS/content,
// including multiple space separated values.
const unquotedContentValueRegex =
  /^(normal|none|(\b(url\([^)]*\)|chapter_counter|attr\([^)]*\)|(no-)?(open|close)-quote|inherit)((\b\s*)|$|\s+))+)$/;

type CssValue = string | number | boolean | undefined;
type CssValueWithArray = CssValue | ReadonlyArray<CssValue>;

function buildValue(key: string, value: CssValue): string {
  if (!isUnitlessNumber[key] && typeof value === 'number') {
    return '' + value + 'px';
  }
  value = String(value);
  if (key === 'content' && !unquotedContentValueRegex.test(value)) {
    return "'" + value.replace(/'/g, "\\'") + "'";
  }
  return value;
}

function buildRule(key: string, value: CssValue) {
  if (value === undefined) {
    return '';
  }

  return hyphenateStyleName(key) + ':' + buildValue(key, value);
}

export default function styleToCssString(rules: CSSProperties) {
  const result: string[] = [];
  for (const styleKey of Object.keys(rules)) {
    const value = (rules as { [key: string]: CssValueWithArray })[styleKey];
    if (Array.isArray(value)) {
      for (const val2 of value) {
        result.push(buildRule(styleKey, val2));
      }
    } else {
      result.push(buildRule(styleKey, value as CssValue));
    }
  }
  return result.join(';');
}
