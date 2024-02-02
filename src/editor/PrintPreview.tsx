/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { useEffect, useState } from 'react';
import ErrorAlert from './ErrorAlert';
import type { GeneralProps } from './types';
import useTransformedData, { DataOrError } from './useTransformedData';
import compile from '../data/compile';
import renderToHtml from '../data/renderToHtml';
import trans from '../translation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const loadingMagicKey = 'loading';

function useCompiledHtml(props: GeneralProps): DataOrError {
  const data = useTransformedData(props);
  const [html, setHtml] = useState<DataOrError>({
    ok: true,
    value: loadingMagicKey,
  });
  useEffect(() => {
    const impl = async () => {
      if (!data.ok) {
        setHtml(data);
        return;
      }
      setHtml({ ok: true, value: loadingMagicKey });
      try {
        const c = await compile(
          props.report,
          data.value,
          props.widgets,
          props.api,
        );
        const result = renderToHtml(c, props.widgets);
        setHtml({ ok: true, value: result });
      } catch (err) {
        setHtml({ ok: false, errorMsg: String(err) });
      }
    };
    impl();
  }, [data, props.api, props.report, props.widgets]);
  return html;
}

export default function PrintPreview(props: GeneralProps) {
  const data = useCompiledHtml(props);
  if (!data.ok) {
    return <ErrorAlert msg={data.errorMsg} />;
  }
  const html = data.value as string;
  if (html === loadingMagicKey) {
    return <FontAwesomeIcon icon={faSpinner} spin />;
  }
  return (
    <iframe
      srcDoc={html}
      style={{
        width: '100%',
        height: 'calc(100vh - 190px)',
        border: 'none',
        backgroundColor: 'white',
      }}
      title={trans('preview')}
    />
  );
}
