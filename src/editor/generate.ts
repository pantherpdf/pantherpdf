/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import { ApiEndpoints, TargetOption, Report } from '../types';
import compile from './compile';
import retrieveOriginalSourceData, {
  SourceData,
} from './retrieveOriginalSourceData';
import { transformData } from './DataTransform';
import renderToHtml from './renderToHtml';
import { encode } from './encoding';
import { Transform, Widget } from './types';
import { defaultTransforms } from '../transforms/allTransforms';
import { defaultWidgets } from '../widgets/allWidgets';

function escapeCsv(txt: string): string {
  return txt.replaceAll('"', '""');
}

function assertUnreachableTarget(_x: never): never {
  throw new Error('Unsupported target');
}

function makeCsv(rows: string[][], newLine: string): string {
  let out = '';
  const cellEnclosing = '"';
  const collSeparator = ';';

  for (const row of rows) {
    for (let i = 0; i < row.length; ++i) {
      if (i !== 0) {
        out += collSeparator;
      }
      out += cellEnclosing + escapeCsv(row[i]) + cellEnclosing;
    }
    out += newLine;
  }
  return out;
}

export function checkCsvFormat(data: any): data is string[][] {
  if (!Array.isArray(data)) {
    return false;
  }
  if (data.length === 0) {
    return true;
  }
  if (!Array.isArray(data[0])) {
    return false;
  }
  const numCols = data[0].length;
  for (const row of data) {
    if (!Array.isArray(row)) {
      return false;
    }
    if (row.length !== numCols) {
      return false;
    }
    for (const cell of row) {
      if (typeof cell !== 'string') {
        return false;
      }
    }
  }
  return true;
}

function targetExtension(type: TargetOption): string {
  if (type === 'pdf') {
    return '.pdf';
  }
  if (type === 'html') {
    return '.html';
  }
  if (type === 'json') {
    return '.json';
  }
  if (type === 'csv-utf-8') {
    return '.csv';
  }
  if (type === 'csv-windows-1250') {
    return '.csv';
  }
  assertUnreachableTarget(type);
}

function correctExtension(
  fileName: string | undefined,
  sourceType: TargetOption,
  targetType: TargetOption,
): string {
  const extTarget = targetExtension(targetType);
  if (fileName) {
    const extSource = targetExtension(sourceType);
    if (extSource !== extTarget && fileName.toLowerCase().endsWith(extSource)) {
      return (
        fileName.substring(0, fileName.length - extSource.length) + extTarget
      );
    }
    return fileName;
  }
  return `report${extTarget}`;
}

export interface FileOutput {
  /** Content */
  body: string | Uint8Array;

  /** MIME type */
  contentType: string;

  /**
   * File name (e.g. report.pdf).
   * Field is generated from `ReportProperties.fileName`
   */
  fileName: string;
}

export interface GenerateArgs {
  /** Report to generate */
  report: Report;

  /** API endpoints to use for generation */
  api: ApiEndpoints;

  /** Source data for report */
  data?: SourceData;

  /** Internal use only. May be removed in the future without any notice. */
  logPerformance?: boolean;

  /** Override target (target is usually specified in a `Report`) */
  target?: TargetOption;

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
 * Output: html, json, csv ...
 * Note that PDF output is not directly supported by this library.
 * @see ApiEndpoints.generatePdf()
 */
export default async function generate(
  props: GenerateArgs,
): Promise<FileOutput> {
  const { report, api, data, logPerformance = false } = props;

  const tDataBefore = logPerformance ? performance.now() : 0;
  const source = await retrieveOriginalSourceData({
    reportDataUrl: report.dataUrl,
    api,
    data,
  });
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
  const tDataAfter = logPerformance ? performance.now() : 0;
  if (logPerformance) {
    console.log(
      `retrieveOriginalSourceData() + transformData() took ${(
        tDataAfter - tDataBefore
      ).toFixed(0)}ms`,
    );
  }

  const tCompileBefore = logPerformance ? performance.now() : 0;
  const reportCompiled = await compile(report, inputData, useWidgets, api);
  const tCompileAfter = logPerformance ? performance.now() : 0;
  if (logPerformance) {
    console.log(
      `compile() took ${(tCompileAfter - tCompileBefore).toFixed(0)}ms`,
    );
  }

  const target = props.target || report.target;

  // PDF, html
  if (target === 'pdf' || target === 'html') {
    const tMakeHtmlBefore = logPerformance ? performance.now() : 0;
    const html = renderToHtml(reportCompiled, useWidgets);
    const tMakeHtmlAfter = logPerformance ? performance.now() : 0;
    if (logPerformance) {
      console.log(
        `renderToHtml() took ${(tMakeHtmlAfter - tMakeHtmlBefore).toFixed(
          0,
        )}ms`,
      );
    }
    if (target === 'html') {
      return {
        body: html,
        contentType: 'text/html; charset=utf-8',
        fileName: correctExtension(
          reportCompiled.properties.fileName,
          reportCompiled.target,
          target,
        ),
      };
    }
    // PDF
    if (!api.generatePdf) {
      throw new Error('generatePdf() not available');
    }
    const tPdfBefore = logPerformance ? performance.now() : 0;
    const pdf = await api.generatePdf(html, reportCompiled.properties);
    const tPdfAfter = logPerformance ? performance.now() : 0;
    if (logPerformance) {
      console.log(`makePdf() took ${(tPdfAfter - tPdfBefore).toFixed(0)}ms`);
    }
    return {
      body: pdf,
      contentType: 'application/pdf',
      fileName: correctExtension(
        reportCompiled.properties.fileName,
        reportCompiled.target,
        target,
      ),
    };
  }

  // JSON
  if (target === 'json') {
    const contents = JSON.stringify(inputData);
    return {
      body: contents,
      contentType: 'application/json',
      fileName: correctExtension(
        reportCompiled.properties.fileName,
        reportCompiled.target,
        target,
      ),
    };
  }

  // CSV utf8
  if (target === 'csv-utf-8') {
    if (!checkCsvFormat(inputData)) {
      throw new Error('data (transformed) is not CSV compatible');
    }
    const csv = makeCsv(inputData, '\n');
    return {
      body: csv,
      contentType: 'text/csv; charset=utf-8',
      fileName: correctExtension(
        reportCompiled.properties.fileName,
        reportCompiled.target,
        target,
      ),
    };
  }

  // CSV Win-1250 CP-1250
  if (target === 'csv-windows-1250') {
    if (!checkCsvFormat(inputData)) {
      throw new Error('data (transformed) is not CSV compatible');
    }
    const csv = makeCsv(inputData, '\r\n');
    const csvBytes = encode(csv, 'cp1250');
    return {
      body: csvBytes,
      contentType: 'text/csv; charset=windows-1250',
      fileName: correctExtension(
        reportCompiled.properties.fileName,
        reportCompiled.target,
        target,
      ),
    };
  }

  assertUnreachableTarget(target);
}