/**
 * @jest-environment node
 */

import getOriginalSourceData, { DataObj } from './getOriginalSourceData';
import { sampleReport } from './sampleReport';

test('getOriginalSourceData javascript', async () => {
  const report = JSON.parse(JSON.stringify(sampleReport));
  const api = {};
  const input: DataObj = {
    type: 'javascript',
    value: `
			async function abc(n1, n2) {
				return n1 + n2
			}
			abc(1, 1)
			abc(5, 4)
		`,
  };
  const data = await getOriginalSourceData({
    report,
    api,
    data: input,
    allowUnsafeJsEval: true,
  });
  expect(data).toBe(9);

  // allowUnsafeJsEval default is false, should reject
  await expect(
    getOriginalSourceData({ report, api, data: input }),
  ).rejects.toThrow();
});
