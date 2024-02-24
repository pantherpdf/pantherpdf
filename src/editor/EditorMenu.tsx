/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { useState } from 'react';
import type { GeneralProps } from './types';
import trans from '../translation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPrint,
  faSpinner,
  faDownload,
  faUndo,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';
import generate from '../data/generate';
import PrintPreview from './PrintPreview';
import SimpleDialog from '../components/SimpleDialog';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';

export default function EditorMenu(props: GeneralProps) {
  const [shownModalPrint, setShownModalPrint] = useState<boolean>(false);
  const navbarProps = props.navbar;

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ height: '100%', overflowX: 'auto' }}
      >
        {navbarProps.left || <div />}
        <Stack direction="row" spacing={3} data-testid="center-buttons">
          <Button
            variant="contained"
            size="large"
            onClick={() => setShownModalPrint(true)}
            data-testid="print"
          >
            <FontAwesomeIcon icon={faPrint} />
          </Button>
          {navbarProps.hasUndoRedo && (
            <ButtonGroup variant="contained" size="large">
              <Button
                onClick={navbarProps.undo}
                disabled={!navbarProps.undo}
                data-testid="undo"
              >
                <FontAwesomeIcon icon={faUndo} />
              </Button>
              <Button
                onClick={navbarProps.redo}
                disabled={!navbarProps.redo}
                data-testid="redo"
              >
                <FontAwesomeIcon icon={faRedo} />
              </Button>
            </ButtonGroup>
          )}
          {navbarProps.isBackendBusy && (
            <FontAwesomeIcon icon={faSpinner} spin />
          )}
        </Stack>
        {navbarProps.right || <div />}
      </Stack>

      {/* Preview */}
      <SimpleDialog
        show={shownModalPrint}
        onHide={() => setShownModalPrint(false)}
        size="md"
        data-testid="dialog-preview"
        title={
          <>
            {trans('preview')}
            {!!props.api.generatePdf && <DownloadButton {...props} />}
          </>
        }
      >
        <PrintPreview {...props} />
      </SimpleDialog>
    </>
  );
}

function DownloadButton(props: GeneralProps) {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  async function genPdfWrapper() {
    if (!props.api.generatePdf) {
      throw new Error('Missing api.generatePdf');
    }
    setIsDownloading(true);
    const src = props.sourceDataOverride ||
      props.sourceData || { type: 'as-is', value: undefined };
    try {
      const res = await generate({
        report: props.report,
        api: props.api,
        data: src,
        transforms: props.transforms,
        widgets: props.widgets,
      });
      const pdf = await props.api.generatePdf(res);
      const blob = new Blob([pdf], { type: 'application/pdf' });
      const fileName = res.properties.fileName || 'report.pdf';
      saveAs(blob, fileName);
    } catch (e) {
      alert(String(e));
    }
    setIsDownloading(false);
  }

  return (
    <Button
      variant="outlined"
      color="secondary"
      sx={{ marginLeft: 0.5 }}
      onClick={genPdfWrapper}
      disabled={isDownloading}
      data-testid="download-pdf"
      startIcon={
        !isDownloading ? (
          <FontAwesomeIcon icon={faDownload} />
        ) : (
          <FontAwesomeIcon icon={faSpinner} spin />
        )
      }
    >
      {trans('download')}
    </Button>
  );
}
