/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { useState } from 'react';
import type { GeneralProps } from './types';
import Trans from '../translation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPrint,
  faSpinner,
  faDownload,
  faUndo,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import compile from './compile';
import renderToHtml from './renderToHtml';
import { saveAs } from 'file-saver';
import generate from './generate';
import SimpleDialog from '../components/SimpleDialog';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';

export default function EditorMenu(props: GeneralProps) {
  const [shownModalPrint, setShownModalPrint] = useState<
    | { html: string }
    | { csv: string[][] }
    | { json: string }
    | { errorMsg: string }
    | undefined
  >(undefined);

  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  async function genPdfWrapper() {
    setIsDownloading(true);
    try {
      const res = await generate({
        report: props.report,
        api: props.api,
        target: 'pdf',
        ...(props.isSourceDataOverriden
          ? { data: { type: 'as-is', value: await props.getSourceData() } }
          : {}),
      });
      const blob = new Blob([res.body], { type: 'application/pdf' });
      saveAs(blob, res.fileName);
    } catch (e) {
      alert(`Error: ${String(e)}`);
    }
    setIsDownloading(false);
  }

  async function print() {
    setIsPrinting(true);
    const data = props.data.data;
    try {
      if (props.report.target === 'pdf' || props.report.target === 'html') {
        const c = await compile(props.report, data, props.widgets, props.api);
        const html = renderToHtml(c, props.widgets);
        setShownModalPrint({ html });
      }
      //
      else if (props.report.target === 'json') {
        setShownModalPrint({ json: JSON.stringify(data) });
      }
      //
      else if (
        props.report.target === 'csv-utf-8' ||
        props.report.target === 'csv-windows-1250'
      ) {
        if (!Array.isArray(data)) {
          throw new Error('data must be 2D array');
        }
        for (const row of data) {
          if (!Array.isArray(row)) {
            throw new Error('data must be 2D array');
          }
        }
        setShownModalPrint({ csv: data });
      }
      //
      else {
        throw new Error('unknown target');
      }
    } catch (e) {
      setShownModalPrint({ errorMsg: String(e) });
    }
    setIsPrinting(false);
  }

  const navbarProps = props.navbar;

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ height: '100%' }}
      >
        {navbarProps.left || <div />}
        <Stack direction="row" spacing={3}>
          <Button variant="contained" size="large" onClick={print}>
            {!isPrinting ? (
              <FontAwesomeIcon icon={faPrint} fixedWidth />
            ) : (
              <FontAwesomeIcon icon={faSpinner} spin fixedWidth />
            )}
          </Button>
          {navbarProps.hasUndoRedo && (
            <ButtonGroup variant="contained" size="large">
              <Button onClick={navbarProps.undo} disabled={!navbarProps.undo}>
                <FontAwesomeIcon icon={faUndo} fixedWidth />
              </Button>
              <Button onClick={navbarProps.redo} disabled={!navbarProps.redo}>
                <FontAwesomeIcon icon={faRedo} fixedWidth />
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
        show={!!shownModalPrint}
        onHide={() => setShownModalPrint(undefined)}
        size="md"
        title={
          <>
            {Trans('preview')}
            {!!props.api.generatePdf && (
              <Button
                variant="outlined"
                color="secondary"
                sx={{ marginLeft: 0.5 }}
                onClick={genPdfWrapper}
                disabled={isDownloading}
                startIcon={
                  !isDownloading ? (
                    <FontAwesomeIcon icon={faDownload} />
                  ) : (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  )
                }
              >
                {Trans('download')}
              </Button>
            )}
          </>
        }
      >
        <>
          {!!shownModalPrint && 'html' in shownModalPrint && (
            <iframe
              srcDoc={shownModalPrint.html}
              style={{
                width: '100%',
                height: 'calc(100vh - 190px)',
                border: 'none',
                backgroundColor: 'white',
              }}
              title={Trans('preview')}
            />
          )}
          {!!shownModalPrint && 'csv' in shownModalPrint && (
            <Table>
              <TableBody>
                {shownModalPrint.csv.map((row, idx) => (
                  <TableRow key={idx}>
                    {row.map((cell, idx2) => (
                      <TableCell key={idx2}>{String(cell)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!!shownModalPrint && 'json' in shownModalPrint && (
            <pre>{shownModalPrint.json}</pre>
          )}
          {!!shownModalPrint && 'errorMsg' in shownModalPrint && (
            <Alert severity="error">
              <AlertTitle>{Trans('error')}</AlertTitle>
              {shownModalPrint.errorMsg}
            </Alert>
          )}
        </>
      </SimpleDialog>
    </>
  );
}
