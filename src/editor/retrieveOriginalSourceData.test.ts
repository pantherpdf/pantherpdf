/**
 * @jest-environment node
 */

import retrieveOriginalSourceData, {
  DataObj,
} from './retrieveOriginalSourceData';
import { sampleReport } from './sampleReport';

test('retrieveOriginalSourceData javascript', async () => {
  const report = JSON.parse(JSON.stringify(sampleReport));
  const api = {};
  const input: DataObj = {
    type: 'javascript',
    value: `
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
    allowUnsafeJsEval: true,
  });
  expect(data).toBe(9);

  // allowUnsafeJsEval default is false, should reject
  await expect(
    retrieveOriginalSourceData({
      reportDataUrl: report.dataUrl,
      api,
      data: input,
    }),
  ).rejects.toThrow();
});
