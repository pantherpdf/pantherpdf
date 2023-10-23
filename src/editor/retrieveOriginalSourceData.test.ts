/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import { ApiEndpoints } from '../types';
import retrieveOriginalSourceData, {
  SourceData,
} from './retrieveOriginalSourceData';
import { sampleReport } from './sampleReport';

test('retrieveOriginalSourceData javascript', async () => {
  const report = JSON.parse(JSON.stringify(sampleReport));
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
  const data = await retrieveOriginalSourceData({
    reportDataUrl: report.dataUrl,
    api,
    data: input,
  });
  expect(data).toBe(9);
});
