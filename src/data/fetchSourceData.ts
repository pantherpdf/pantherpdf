/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import type { ApiEndpoints } from '../types';

type SourceDataUrl = { type: 'url'; url: string; description?: string };
export type SourceData =
  | { type: 'as-is'; value: unknown; description?: string }
  | { type: 'javascript'; code: string; description?: string }
  | SourceDataUrl
  | { type: 'json'; value: string; description?: string }
  | { type: 'callback'; callback: () => unknown; description?: string };

/** Load unmodified source data from specified source */
export default async function fetchSourceData(
  api: ApiEndpoints,
  obj: SourceData,
): Promise<unknown> {
  const type = obj.type;
  switch (type) {
    case 'as-is':
      return obj.value;
    case 'javascript': {
      // eslint-disable-next-line no-new-func
      const func = new Function(obj.code);
      return await func();
    }
    case 'url':
      return getDataFromUrl(obj, api);
    case 'json':
      return JSON.parse(obj.value);
    case 'callback':
      return await obj.callback();
    default:
      const exhaustiveCheck: never = type;
      throw new Error(`Unknown data type: ${exhaustiveCheck}`);
  }
}

async function getDataFromUrl(
  value: SourceDataUrl,
  api: ApiEndpoints,
): Promise<unknown> {
  const { url } = value;
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
    return fetchSourceData(api, {
      description: value.description,
      type: 'javascript',
      code,
    });
  }
  if (ct === 'application/json') {
    const data = await r.json();
    return fetchSourceData(api, {
      description: value.description,
      type: 'as-is',
      value: data,
    });
  }
  throw new Error('unsupported content-type');
}
