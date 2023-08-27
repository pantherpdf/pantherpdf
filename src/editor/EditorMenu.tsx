import React, { useState } from 'react';
import type { GeneralProps } from './types';
import Trans from '../translation';
import style from './EditorMenu.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPrint,
  faSpinner,
  faDownload,
  faUndo,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import { Modal } from 'react-bootstrap';
import compile from './compile';
import renderToHtml from './renderToHtml';
import { saveAs } from 'file-saver';
import generateTarget from './generateTarget';

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
      const res = await generateTarget({
        report: props.report,
        api: props.api,
        targetOverride: 'pdf',
        ...(props.isSourceDataOverriden
          ? { data: { type: 'as-is', value: await props.getSourceData() } }
          : {}),
      });
      const blob = new Blob([res.body], { type: 'application/pdf' });
      saveAs(blob, res.filename);
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

  return (
    <>
      <header className="mb-3 fixed-top bg">
        <div className="container">
          <div className="d-flex py-2">
            <ul className="nav flex-grow-1">
              {props.homeLink && (
                <li>
                  <a
                    href={props.homeLink.url}
                    target="_parent"
                    className="nav-link px-3 link-secondary"
                  >
                    {props.homeLink.text}
                  </a>
                </li>
              )}
            </ul>
            <div>
              <button
                type="button"
                className="btn btn-outline-secondary me-3"
                onClick={print}
              >
                {!isPrinting ? (
                  <FontAwesomeIcon icon={faPrint} fixedWidth />
                ) : (
                  <FontAwesomeIcon icon={faSpinner} spin fixedWidth />
                )}
              </button>
              {props.hasUndoRedo && (
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={props.undo}
                    disabled={!props.undo}
                  >
                    <FontAwesomeIcon icon={faUndo} fixedWidth />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={props.redo}
                    disabled={!props.redo}
                  >
                    <FontAwesomeIcon icon={faRedo} fixedWidth />
                  </button>
                </div>
              )}
              {props.isBackendBusy && <FontAwesomeIcon icon={faSpinner} spin />}
            </div>
            <div className="flex-grow-1 d-flex justify-content-end">
              <ul className="nav">
                {/*<li><button className="btn nav-link px-3 link-secondary">Logout</button></li>*/}
              </ul>
            </div>
          </div>
        </div>
      </header>
      <div style={{ height: '60px' }} />

      {/* Preview */}
      <Modal
        show={!!shownModalPrint}
        onHide={() => setShownModalPrint(undefined)}
        dialogClassName={style.modalPreviewDialog}
        contentClassName={style.modalPreviewContent}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {Trans('preview')}
            {!!props.api.generatePdf && (
              <button
                className="btn btn-outline-secondary ms-2"
                onClick={genPdfWrapper}
                disabled={isDownloading}
              >
                {!isDownloading ? (
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                ) : (
                  <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                )}
                {Trans('download')}
              </button>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!!shownModalPrint && 'html' in shownModalPrint && (
            <iframe
              srcDoc={shownModalPrint.html}
              style={{ width: '100%', height: 'calc(100vh - 130px)' }}
              title="preview"
            />
          )}
          {!!shownModalPrint && 'csv' in shownModalPrint && (
            <table className="table">
              <tbody>
                {shownModalPrint.csv.map((row, idx) => (
                  <tr key={idx}>
                    {row.map((cell, idx2) => (
                      <td key={idx2}>{String(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!!shownModalPrint && 'json' in shownModalPrint && (
            <pre>{shownModalPrint.json}</pre>
          )}
          {!!shownModalPrint && 'errorMsg' in shownModalPrint && (
            <div className="alert alert-danger">{shownModalPrint.errorMsg}</div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
