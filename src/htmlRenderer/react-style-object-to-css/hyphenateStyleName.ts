/**
 * @project https://github.com/Calvin92/react-style-object-to-css
 * @copyright 2018 Calvin, 2023 Ignac Banic
 * @license MIT
 */

const msPattern = /^ms-/;

const _uppercasePattern = /([A-Z])/g;

/**
 * Hyphenates a camelcased string, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *
 * For CSS style names, use `hyphenateStyleName` instead which works properly
 * with all vendor prefixes, including `ms`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenate(string: string): string {
  return string.replace(_uppercasePattern, '-$1').toLowerCase();
}

/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenateStyleName('backgroundColor')
 *   < "background-color"
 *   > hyphenateStyleName('MozTransition')
 *   < "-moz-transition"
 *   > hyphenateStyleName('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 *
 * @param {string} string
 * @return {string}
 */
export default function hyphenateStyleName(string: string): string {
  return hyphenate(string).replace(msPattern, '-ms-');
}
