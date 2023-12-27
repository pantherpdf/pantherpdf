/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import { useEffect, useState } from 'react';
import type { GeneralProps } from './types';
import fetchSourceData, { SourceData } from '../data/fetchSourceData';
import type { ApiEndpoints } from '../types';
import { transformData } from '../transforms/transformData';
import type { Transform, TransformItem } from '../transforms/types';

export type DataOrError =
  | { ok: true; value: unknown }
  | { ok: false; errorMsg: string };

async function refreshData(
  api: ApiEndpoints,
  src: SourceData,
  transformItems: TransformItem[],
  transforms: Transform[],
  numTransToApply?: number,
): Promise<DataOrError> {
  try {
    const dt1 = await fetchSourceData(api, src);
    const dt2 = await transformData(
      transforms,
      dt1,
      transformItems,
      numTransToApply,
    );
    return { ok: true, value: dt2 };
  } catch (e) {
    let errorMsg = String(e);
    if (errorMsg.trim().length === 0) {
      errorMsg = 'unknown error';
    }
    return { ok: false, errorMsg };
  }
}

export default function useTransformedData(
  props: GeneralProps,
  numTransToApply?: number,
) {
  const [data, setData] = useState<DataOrError>({
    ok: false,
    errorMsg: 'loading data ...',
  });
  useEffect(() => {
    const src = props.sourceDataOverride ||
      props.sourceData || { type: 'as-is', value: undefined };
    refreshData(
      props.api,
      src,
      props.report.transforms,
      props.transforms,
      numTransToApply,
    ).then(setData);
  }, [
    props.api,
    props.sourceData,
    props.sourceDataOverride,
    props.report.transforms,
    props.transforms,
    numTransToApply,
  ]);
  return data;
}
