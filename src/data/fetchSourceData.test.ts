/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import type { ApiEndpoints } from '../types';
import fetchSourceData, { SourceData } from './fetchSourceData';

test('fetchSourceData javascript', async () => {
  const api: ApiEndpoints = {
    evaluateJavaScript: async (code: string) => {
      // eslint-disable-next-line no-new-func
      const func = new Function(code);
      return await func();
    },
  };
  const input: SourceData = {
    type: 'javascript',
    code: `
			async function abc(n1, n2) {
				return n1 + n2
			}
			return abc(5, 4)
		`,
  };
  const data = await fetchSourceData(api, input);
  expect(data).toBe(9);
});
