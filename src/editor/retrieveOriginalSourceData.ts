/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import { ApiEndpoints } from '../types';

export type SourceData =
  | { type: 'as-is'; value: unknown }
  | { type: 'javascript'; code: string }
  | { type: 'url'; url: string };
interface Args {
  reportDataUrl: string;
  api: ApiEndpoints;
  data?: SourceData;
}

async function dataFromObj(
  obj: SourceData,
  api: ApiEndpoints,
): Promise<unknown> {
  if (obj.type === 'as-is') {
    return obj.value;
  }

  if (obj.type === 'javascript') {
    if (!api.evaluateJavaScript) {
      throw new Error('Evaluating JS is disabled');
    }
    return await api.evaluateJavaScript(obj.code);
  }

  if (obj.type === 'url') {
    return getDataFromUrl(obj.url, api);
  }

  throw new Error('Unknown data type');
}

export async function getDataFromUrl(
  url: string,
  api: ApiEndpoints,
): Promise<unknown> {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('Only absolute url is allowed');
  }
  let r: Response;
  try {
    r = await fetch(url, {
      headers: {
        Accept: 'text/javascript, application/json',
      },
    });
  } catch (err) {
    throw new Error(
      `Error while requesting data from url "${url}". Error: ${String(err)}`,
    );
  }
  if (r.status !== 200) {
    throw new Error(`Bad response status: ${r.status}`);
  }
  const ct = (r.headers.get('Content-Type') || '').split(';')[0].trim();
  if (ct === 'text/javascript' || ct === 'application/javascript') {
    const code = await r.text();
    return dataFromObj({ type: 'javascript', code }, api);
  }
  if (ct === 'application/json') {
    const data = await r.json();
    return dataFromObj({ type: 'as-is', value: data }, api);
  }
  throw new Error('unsupported data content-type');
}

export default async function retrieveOriginalSourceData(
  args: Args,
): Promise<unknown> {
  const { reportDataUrl, api, data } = args;

  if (data) {
    return dataFromObj(data, api);
  }
  if (reportDataUrl.length > 0) {
    if (reportDataUrl.startsWith('local/')) {
      if (!api.filesDownload) {
        throw new Error('missing api filesDownload');
      }
      const obj = await api.filesDownload(reportDataUrl.substring(6));
      if (
        obj.mimeType === 'text/javascript' ||
        obj.mimeType === 'application/javascript'
      ) {
        const code = new TextDecoder('utf-8').decode(obj.data);
        return dataFromObj({ type: 'javascript', code }, api);
      }
      if (obj.mimeType === 'application/json') {
        const data = new TextDecoder('utf-8').decode(obj.data);
        return dataFromObj({ type: 'as-is', value: data }, api);
      }
      throw new Error('unsupported data content-type');
    }
    return getDataFromUrl(reportDataUrl, api);
  }
  return undefined;
}
