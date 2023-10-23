/**
 * @file General settings/properties of a report
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React, { useState } from 'react';
import { GeneralProps } from './types';
import type { TargetOption, Report } from '../types';
import { isReport } from '../types';
import Trans from '../translation';
import PropertyFont, { TFont } from '../widgets/PropertyFont';
import InputApplyOnEnter from '../widgets/InputApplyOnEnter';
import Property4SideInput, {
  Value as Property4SideInputValue,
} from '../widgets/Property4SideInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faUpload,
  faCaretDown,
  faCaretUp,
} from '@fortawesome/free-solid-svg-icons';
import VarEditor from './VarEditor';
import { saveAs } from 'file-saver';
import style from './EditWidgets.module.css';
import globalStyle from '../globalStyle.module.css';

// hack to get array of possible values
// because I can only import types from shared
const TargetOptionTmpObj: { [key in TargetOption]: number } = {
  pdf: 1,
  html: 1,
  json: 1,
  'csv-utf-8': 1,
  'csv-windows-1250': 1,
};
const TargetOptionTmpKeys = Object.keys(TargetOptionTmpObj);

function fileReportUpload(
  arr: Report[],
  setArr: React.Dispatch<React.SetStateAction<Report[]>>,
) {
  const el = document.createElement('input');
  el.type = 'file';
  el.accept = 'application/json';
  el.addEventListener('change', () => {
    if (!el.files) {
      return;
    }
    const fl = el.files[0];
    const fr = new FileReader();
    fr.addEventListener('load', e3 => {
      if (!e3.target || typeof e3.target.result !== 'string') {
        throw new Error('Bad value');
      }
      let dt;
      try {
        dt = JSON.parse(e3.target.result);
      } catch (e) {
        alert(Trans('upload bad file') + ' ' + String(e));
        return;
      }
      if (!isReport(dt)) {
        alert('Bad data');
        return;
      }
      let n = arr.length;
      setArr([...arr, dt]);
      alert(Trans('upload finished', [(n + 1).toString()]));
    });
    fr.readAsText(fl);
  });
  el.click();
}

function ShowUpload(props: GeneralProps) {
  const [arr, setArr] = useState<Report[]>([]);

  function fileDownload() {
    let blob = new Blob([JSON.stringify(props.report, null, 4)], {
      type: 'application/json',
    });
    saveAs(blob, 'report.json');
  }

  function dragStartFile(e: React.DragEvent<HTMLDivElement>, dt: Report) {
    return props.dragWidgetStart(e, { type: 'widgets', widgets: dt.children });
  }

  return (
    <>
      <div className="btn-group" role="group">
        <button className="btn btn-outline-secondary" onClick={fileDownload}>
          <FontAwesomeIcon icon={faDownload} fixedWidth className="me-2" />
          {Trans('export')}
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => fileReportUpload(arr, setArr)}
        >
          <FontAwesomeIcon icon={faUpload} fixedWidth className="me-2" />
          {Trans('import')}
        </button>
      </div>
      {arr.length > 0 && <hr />}
      {arr.map((r, idx) => (
        <div
          key={idx}
          draggable={true}
          onDragStart={e => dragStartFile(e, r)}
          onDragEnd={props.dragWidgetEnd}
          className={style.widget}
        >
          {r.name}&nbsp;
        </div>
      ))}
    </>
  );
}

export default function ReportSettings(props: GeneralProps) {
  const [showMore, setShowMore] = useState<boolean>(false);

  async function changeTarget(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value;
    const obj: Report = { ...props.report, target: value as TargetOption };
    return props.setReport(obj);
  }

  async function changeFont(value: TFont) {
    const obj: Report = {
      ...props.report,
      properties: { ...props.report.properties },
    };
    if (Object.keys(value).length > 0) {
      obj.properties.font = value;
    } else {
      delete obj.properties.font;
    }
    return props.setReport(obj);
  }

  async function changeMargin(value: Property4SideInputValue) {
    const obj: Report = {
      ...props.report,
      properties: { ...props.report.properties },
    };
    obj.properties.margin = value;
    return props.setReport(obj);
  }

  async function changeProperty(
    key: keyof typeof props.report.properties,
    value: string | number,
  ) {
    const obj: Report = {
      ...props.report,
      properties: { ...props.report.properties },
    };
    if (key === 'fileName' && typeof value === 'string') {
      obj.properties[key] = value;
    } else if (key === 'lang' && typeof value === 'string') {
      obj.properties[key] = value;
    } else if (key === 'paperWidth' && typeof value === 'number') {
      obj.properties[key] = value;
    } else if (key === 'paperHeight' && typeof value === 'number') {
      obj.properties[key] = value;
    } else {
      throw new Error('bad value');
    }
    return props.setReport(obj);
  }

  async function deleteProperty(key: keyof typeof props.report.properties) {
    const obj: Report = {
      ...props.report,
      properties: { ...props.report.properties },
    };
    delete obj.properties[key];
    return props.setReport(obj);
  }

  const margin: Property4SideInputValue = props.report.properties.margin
    ? props.report.properties.margin
    : [0, 0, 0, 0];
  return (
    <>
      <div className={globalStyle.vform}>
        <label htmlFor="report-name">{Trans('name')}</label>
        <div className="input-group">
          <InputApplyOnEnter
            id="report-name"
            value={props.report.name}
            onChange={val => {
              const obj = { ...props.report, name: String(val) };
              return props.setReport(obj);
            }}
          />
        </div>
      </div>

      <div className={globalStyle.hform}>
        <label htmlFor="target">{Trans('target')}</label>
        <select
          className="form-select"
          id="target"
          value={props.report.target}
          onChange={changeTarget}
        >
          {TargetOptionTmpKeys.map(tp => (
            <option key={tp} value={tp}>
              {tp}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setShowMore(!showMore)}
        >
          <FontAwesomeIcon
            icon={showMore ? faCaretUp : faCaretDown}
            className="me-2"
          />
          {Trans(showMore ? 'show less' : 'show more')}
        </button>
      </div>

      {showMore && (
        <>
          <div className={globalStyle.vform}>
            <label htmlFor="fileName">{Trans('fileName')}</label>
            <div className="input-group">
              <span className="input-group-text fst-italic">ƒ</span>
              <InputApplyOnEnter
                id="fileName"
                value={props.report.properties.fileName || ''}
                onChange={val =>
                  typeof val === 'string' && val.length > 0
                    ? changeProperty('fileName', val)
                    : deleteProperty('fileName')
                }
              />
            </div>
          </div>

          <div className={globalStyle.hform}>
            <label htmlFor="lang">{Trans('lang')}</label>
            <div>
              <InputApplyOnEnter
                id="lang"
                value={props.report.properties.lang || ''}
                onChange={val =>
                  typeof val === 'string' && val.length > 0
                    ? changeProperty('lang', val)
                    : deleteProperty('lang')
                }
              />
              <small className="text-muted">
                {Trans('lang 2 letter iso code')}
              </small>
            </div>
          </div>

          {props.report.target === 'pdf' && (
            <>
              <div className={globalStyle.hform}>
                <label>{Trans('font')}</label>
                <div className="input-group">
                  <PropertyFont
                    value={
                      props.report.properties.font
                        ? props.report.properties.font
                        : {}
                    }
                    onChange={changeFont}
                    googleFontApiKey={props.api.googleFontApiKey}
                  />
                </div>
              </div>

              <div className={globalStyle.section}>
                {Trans('paper')}
                <small className="text-muted ms-2">
                  {Trans('0 means default')}
                </small>
              </div>

              <div className={globalStyle.hform}>
                <label htmlFor="paperWidth">{Trans('width')}</label>
                <div className="input-group">
                  <InputApplyOnEnter
                    id="paperWidth"
                    min="0"
                    max="10000"
                    value={
                      props.report.properties.paperWidth
                        ? props.report.properties.paperWidth
                        : 0
                    }
                    onChange={val =>
                      val
                        ? changeProperty('paperWidth', val)
                        : deleteProperty('paperWidth')
                    }
                  />
                  <span className="input-group-text">mm</span>
                </div>
              </div>

              <div className={globalStyle.hform}>
                <label htmlFor="paperHeight">{Trans('height')}</label>
                <div className="input-group">
                  <InputApplyOnEnter
                    id="paperHeight"
                    min="0"
                    max="10000"
                    value={
                      props.report.properties.paperHeight
                        ? props.report.properties.paperHeight
                        : 0
                    }
                    onChange={val =>
                      val
                        ? changeProperty('paperHeight', val)
                        : deleteProperty('paperHeight')
                    }
                  />
                  <span className="input-group-text">mm</span>
                </div>
              </div>

              <div className={globalStyle.section}>
                {Trans('margin')}
                <small className="text-muted ms-2">mm</small>
              </div>
              <Property4SideInput value={margin} onChange={changeMargin} />
            </>
          )}

          <VarEditor {...props} />

          <div className={globalStyle.section}>{Trans('import export')}</div>
          <ShowUpload {...props} />
        </>
      )}
    </>
  );
}
