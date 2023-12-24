/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import type { ApiEndpoints, Output, Report } from '../types';
import compile from './compile';
import fetchSourceData, { SourceData } from './fetchSourceData';
import { transformData } from '../transforms/transformData';
import renderToHtml from './renderToHtml';
import type { Transform } from '../transforms/types';
import type { Widget } from '../widgets/types';
import { defaultTransforms } from '../transforms/allTransforms';
import { defaultWidgets } from '../widgets/allWidgets';

export interface GenerateArgs {
  /** Report to generate */
  report: Report;

  /** API endpoints to use for generation */
  api: ApiEndpoints;

  /** Source data for report */
  data?: SourceData;

  /**
   * Specify which transforms are available to this report.
   * Include custom transform: `[...defaultTransforms, myCustomTransform]`
   */
  transforms?: Transform[];

  /**
   * Specify which widgets are available to this report.
   * Include custom widget: `[...defaultWidgets, myCustomWidget]`
   */
  widgets?: Widget[];
}

/**
 * Generate target
 *
 * Input: report, source data
 * Output: html with meta data
 * Note that PDF output is not directly supported by this library.
 */
export default async function generate(props: GenerateArgs): Promise<Output> {
  const { report, api, data } = props;

  const source = data ? await fetchSourceData(api, data) : undefined;
  const useTransforms = Array.isArray(props.transforms)
    ? props.transforms
    : defaultTransforms;
  const useWidgets = Array.isArray(props.widgets)
    ? props.widgets
    : defaultWidgets;
  const inputData = await transformData(
    useTransforms,
    source,
    report.transforms,
  );

  const reportCompiled = await compile(report, inputData, useWidgets, api);

  const html = renderToHtml(reportCompiled, useWidgets);
  return {
    html,
    properties: reportCompiled.properties,
  };
}
