/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import ErrorAlert from './ErrorAlert';
import type { GeneralProps } from './types';
import useTransformedData from './useTransformedData';

export default function RenderContentJson(props: GeneralProps) {
  const data = useTransformedData(props);
  if (!data.ok) {
    return <ErrorAlert msg={data.errorMsg} />;
  }
  try {
    const content = JSON.stringify(data);
    return <pre style={{ whiteSpace: 'normal' }}>{content}</pre>;
  } catch (e) {
    return <ErrorAlert msg={String(e)} />;
  }
}
