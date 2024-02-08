/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023-2024
 * @license MIT
 */

import { Image, ImageData } from './Image';
import { renderWidget } from '../unitTestHelpers';
import { sampleReport } from '../editor/sampleReport';
import type { WidgetNewProps } from './types';

test('Image should render svg', async () => {
  const content = `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <rect x="37.03" y="43.969" width="420.811" height="419.344" style="fill: rgb(216, 216, 216); stroke: rgb(0, 0, 0);"/>
</svg>`;
  const helper: WidgetNewProps = { report: sampleReport };
  const el = (await Image.newItem(helper)) as ImageData;
  el.url = { formula: `data.generateImg()` };
  const data = {
    generateImg: () => {
      return content;
    },
  };
  const html = await renderWidget(el, data);
  expect(html).toMatchSnapshot();
});
