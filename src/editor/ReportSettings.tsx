/**
 * @file General settings/properties of a report
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { CSSProperties, useState } from 'react';
import type { GeneralProps } from './types';
import type { TargetOption, Report, Paper } from '../types';
import { isReport } from '../types';
import Trans from '../translation';
import PropertyFont, { TFont } from '../widgets/PropertyFont';
import PaperEditor from './PaperEditor';
import InputApplyOnEnter, {
  inputFAdornment,
} from '../widgets/InputApplyOnEnter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faUpload,
  faCaretDown,
  faCaretUp,
} from '@fortawesome/free-solid-svg-icons';
import VarEditor from './VarEditor';
import { saveAs } from 'file-saver';
import SectionName from '../components/SectionName';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';

const styleWidget: CSSProperties = {
  padding: '3px 5px',
  margin: '2px 0',
  cursor: 'grab',
};

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
      <ButtonGroup color="secondary" variant="outlined">
        <Button
          onClick={fileDownload}
          startIcon={<FontAwesomeIcon icon={faDownload} fixedWidth />}
        >
          {Trans('export')}
        </Button>
        <Button
          onClick={() => fileReportUpload(arr, setArr)}
          startIcon={<FontAwesomeIcon icon={faUpload} fixedWidth />}
        >
          {Trans('import')}
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
          {r.name}&nbsp;
        </div>
      ))}
    </>
  );
}

export default function ReportSettings(props: GeneralProps) {
  const [showMore, setShowMore] = useState<boolean>(false);

  async function changeTarget(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
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
      obj.properties[key] = value;
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
      <InputApplyOnEnter
        component={TextField}
        value={props.report.name}
        onChange={val => {
          const obj = { ...props.report, name: String(val) };
          return props.setReport(obj);
        }}
        id="report-name"
        label={Trans('name')}
        fullWidth
      />

      <TextField
        id="target"
        select
        label={Trans('target')}
        value={props.report.target}
        onChange={changeTarget}
        fullWidth
      >
        {TargetOptionTmpKeys.map(tp => (
          <MenuItem key={tp} value={tp}>
            {tp}
          </MenuItem>
        ))}
      </TextField>

      <Button
        size="small"
        color="secondary"
        variant="outlined"
        onClick={() => setShowMore(!showMore)}
        startIcon={
          <FontAwesomeIcon icon={showMore ? faCaretUp : faCaretDown} />
        }
      >
        {Trans(showMore ? 'show less' : 'show more')}
      </Button>

      {showMore && (
        <>
          <InputApplyOnEnter
            component={TextField}
            value={props.report.properties.fileName || ''}
            onChange={val =>
              typeof val === 'string' && val.length > 0
                ? changeProperty('fileName', val)
                : deleteProperty('fileName')
            }
            label={Trans('fileName')}
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
            label={Trans('lang')}
            id="lang"
            helperText={Trans('lang 2 letter iso code')}
          />

          {props.report.target === 'pdf' && (
            <>
              <PropertyFont
                value={
                  props.report.properties.font
                    ? props.report.properties.font
                    : {}
                }
                onChange={changeFont}
                googleFontApiKey={props.api.googleFontApiKey}
              />

              <PaperEditor
                unit={props.language === 'en-us' ? 'inch' : 'mm'}
                value={props.report.properties.paper || {}}
                onChange={paperChanged}
              />
            </>
          )}

          <VarEditor {...props} />

          <SectionName text={Trans('import export')} />
          <ShowUpload {...props} />
        </>
      )}
    </>
  );
}
