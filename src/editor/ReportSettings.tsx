/**
 * @file General settings/properties of a report
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import React, { CSSProperties, useState } from 'react';
import type { GeneralProps } from './types';
import type { Report, Paper } from '../types';
import isReport from '../data/isReport';
import trans from '../translation';
import PropertyFont, { TFont } from '../widgets/PropertyFont';
import PaperEditor from './PaperEditor';
import InputApplyOnEnter, {
  inputFAdornment,
} from '../components/InputApplyOnEnter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faUpload,
  faCaretDown,
  faCaretUp,
  faFile,
} from '@fortawesome/free-solid-svg-icons';
import VarEditor from './VarEditor';
import { saveAs } from 'file-saver';
import SectionName from '../components/SectionName';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

const styleWidget: CSSProperties = {
  padding: '3px 5px',
  margin: '2px 0',
  cursor: 'grab',
};

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
        alert(trans('upload bad file') + ' ' + String(e));
        return;
      }
      if (!isReport(dt)) {
        alert('Bad data');
        return;
      }
      const n = arr.length;
      setArr([...arr, dt]);
      alert(trans('report upload finished', [(n + 1).toString()]));
    });
    fr.readAsText(fl);
  });
  el.click();
}

function ShowUpload(props: GeneralProps) {
  const [arr, setArr] = useState<Report[]>([]);

  function fileDownload() {
    const blob = new Blob([JSON.stringify(props.report, null, 4)], {
      type: 'application/json',
    });
    saveAs(blob, 'report.json');
  }

  function dragStartFile(e: React.DragEvent<HTMLDivElement>, dt: Report) {
    return props.dragWidgetStart(e, { type: 'widgets', widgets: dt.widgets });
  }

  return (
    <>
      <ButtonGroup color="secondary" variant="outlined">
        <Button
          onClick={fileDownload}
          startIcon={<FontAwesomeIcon icon={faDownload} fixedWidth />}
        >
          {trans('export')}
        </Button>
        <Button
          onClick={() => fileReportUpload(arr, setArr)}
          startIcon={<FontAwesomeIcon icon={faUpload} fixedWidth />}
        >
          {trans('import')}
        </Button>
      </ButtonGroup>
      {arr.length > 0 && <Divider />}
      {arr.map((r, idx) => (
        <div
          key={idx}
          draggable
          onDragStart={e => dragStartFile(e, r)}
          onDragEnd={props.dragWidgetEnd}
          style={styleWidget}
        >
          <FontAwesomeIcon icon={faFile} style={{ marginRight: '0.5rem' }} />
          {trans('uploaded report')}
        </div>
      ))}
    </>
  );
}

export default function ReportSettings(props: GeneralProps) {
  const [showMore, setShowMore] = useState<boolean>(false);

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

  async function changeProperty(
    key: keyof typeof props.report.properties,
    value: string | number,
  ) {
    const obj: Report = {
      ...props.report,
      properties: {
        ...props.report.properties,
        paper: props.report.properties.paper
          ? { ...props.report.properties.paper }
          : {},
      },
    };
    if (key === 'fileName' && typeof value === 'string') {
      obj.properties[key] = { formula: value };
    } else if (key === 'lang' && typeof value === 'string') {
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

  async function paperChanged(value: Paper) {
    const obj: Report = {
      ...props.report,
      properties: { ...props.report.properties },
    };
    if (Object.keys(value).length > 0) {
      obj.properties.paper = value;
    } else {
      delete obj.properties.paper;
    }
    return props.setReport(obj);
  }

  return (
    <>
      <Button
        size="small"
        color="secondary"
        variant="outlined"
        onClick={() => setShowMore(!showMore)}
        startIcon={
          <FontAwesomeIcon icon={showMore ? faCaretUp : faCaretDown} />
        }
      >
        {trans(showMore ? 'show less' : 'show more')}
      </Button>

      {showMore && (
        <>
          <InputApplyOnEnter
            component={TextField}
            value={props.report.properties.fileName?.formula || ''}
            onChange={val =>
              typeof val === 'string' && val.length > 0
                ? changeProperty('fileName', val)
                : deleteProperty('fileName')
            }
            label={trans('fileName')}
            id="fileName"
            InputProps={inputFAdornment}
            fullWidth
          />

          <InputApplyOnEnter
            component={TextField}
            value={props.report.properties.lang || ''}
            onChange={val =>
              typeof val === 'string' && val.length > 0
                ? changeProperty('lang', val)
                : deleteProperty('lang')
            }
            label={trans('lang')}
            id="lang"
            helperText={trans('lang 2 letter iso code')}
          />

          <PropertyFont
            api={props.api}
            value={
              props.report.properties.font ? props.report.properties.font : {}
            }
            onChange={changeFont}
          />

          <PaperEditor
            unit={props.language === 'en-us' ? 'inch' : 'mm'}
            value={props.report.properties.paper || {}}
            onChange={paperChanged}
          />

          <VarEditor {...props} />

          <SectionName text={trans('import export')} />
          <ShowUpload {...props} />
        </>
      )}
    </>
  );
}
