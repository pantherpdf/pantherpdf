import { ApiEndpoints } from '../types';

export type DataTypes = 'as-is' | 'javascript' | 'url';
export type DataObj = { value: unknown; type: DataTypes };
interface Args {
  reportDataUrl: string;
  api: ApiEndpoints;
  data?: DataObj;
  allowUnsafeJsEval?: boolean;
}

async function dataFromObj(
  value: unknown,
  type: DataTypes,
  allowUnsafeJsEval: boolean,
): Promise<unknown> {
  if (type === 'as-is') {
    return value;
  }

  if (type === 'javascript') {
    if (!allowUnsafeJsEval) {
      throw new Error('Evaluating JS is disabled');
    }
    if (typeof value !== 'string') {
      throw new Error('JS code should be string');
    }
    return evalJs(value);
  }

  if (type === 'url') {
    if (typeof value !== 'string') {
      throw new Error('JS code should be string');
    }
    return getDataFromUrl(value, allowUnsafeJsEval);
  }

  throw new Error('Unknown data type');
}

async function evalJs(code: string): Promise<unknown> {
  // cannot import module because import() gets transformed into something else
  //const module = await import(url)

  // cannot eval and import because nodejs doesnt support importing from http://
  //const enc = encodeURIComponent(url)
  //const prms = eval(`import("${decodeURIComponent(enc)}")`)
  //const module = await prms
  //const getData = module.default
  //return getData()

  // eval() did not work with Parcel.
  // https://parceljs.org/features/scope-hoisting/#avoid-eval
  // Parcel cannot rename any of the variables within the scope where eval() is used.
  //const data = await eval(code)

  // eslint-disable-next-line no-new-func
  const func = new Function(code);
  const data = await func();
  return data;
}

export async function getDataFromUrl(
  url: string,
  allowUnsafeJsEval: boolean,
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
    return dataFromObj(code, 'javascript', allowUnsafeJsEval);
  }
  if (ct === 'application/json') {
    const data = await r.json();
    return dataFromObj(data, 'as-is', allowUnsafeJsEval);
  }
  throw new Error('unsupported data content-type');
}

export default async function retrieveOriginalSourceData(
  args: Args,
): Promise<unknown> {
  const { reportDataUrl, api, data, allowUnsafeJsEval = false } = args;

  if (data) {
    return dataFromObj(data.value, data.type, allowUnsafeJsEval);
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
        return dataFromObj(code, 'javascript', allowUnsafeJsEval);
      }
      if (obj.mimeType === 'application/json') {
        const data = new TextDecoder('utf-8').decode(obj.data);
        return dataFromObj(data, 'as-is', allowUnsafeJsEval);
      }
      throw new Error('unsupported data content-type');
    }
    return getDataFromUrl(reportDataUrl, allowUnsafeJsEval);
  }
  return undefined;
}