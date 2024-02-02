/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import React from 'react';
import type { GeneralProps } from './types';
import ObjectExplorer from './ObjectExplorer';
import useTransformedData from './useTransformedData';

export default function TransformedDataExplorer(props: GeneralProps) {
  const data = useTransformedData(props);
  if (data.ok) {
    return (
      <div>
        <ObjectExplorer data={data.value} />
      </div>
    );
  }
  return <div>{data.errorMsg}</div>;
}
