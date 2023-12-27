/**
 * @file Custom environment extending JSDOM with suport for TextEncoder. See https://github.com/jsdom/jsdom/issues/2524
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import JSDOMEnvironment from 'jest-environment-jsdom';
import { TextEncoder } from 'node:util';

export default class JSDOMExtEnvironment extends JSDOMEnvironment {
  async setup() {
    await super.setup();
    if (typeof this.global.TextEncoder === 'undefined') {
      this.global.TextEncoder = TextEncoder;
    }
  }
}
