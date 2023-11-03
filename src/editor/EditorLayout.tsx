/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React from 'react';
import { defaultReportCss, Item } from '../types';
import { GeneralProps } from './types';
import Trans, { TransName } from '../translation';
import {
  PropertyFontExtractStyle,
  PropertyFontGenCss,
} from '../widgets/PropertyFont';
import EditorMenu from './EditorMenu';
import ObjectExplorer from './ObjectExplorer';
import DataTransform from './DataTransform';
import EditWidgetNew from './EditWidgetNew';
import { getWidget } from '../widgets/allWidgets';
import { findInList, removeFromList, updateItem } from './childrenMgmt';
import ReportSettings from './ReportSettings';
import { extractFiles } from '../FileSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { LoadGoogleFontCss } from '../widgets/GoogleFonts';
import SectionName from '../components/SectionName';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const BoxMain = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: '20%',
  top: '0', // keep 0, to prevent scroll bar from appearing when content is smaller than window
  right: '20%',
  minHeight: '100vh',
  padding: '4rem 1rem 0 1rem',
  backgroundColor: 'white',
  '&:focus': {
    outline: 'none',
  },
  [theme.breakpoints.down('md')]: {
    left: '0',
    right: '0',
  },
}));

const BoxMenu = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  left: '0',
  right: '0',
  top: '0',
  height: '4rem',
  zIndex: 10,
  borderBottom: '1px solid #ddd',
}));

const Box1 = styled('div')(({ theme }) => ({
  position: 'fixed',
  overflowY: 'auto',
  left: '0',
  top: '4rem',
  bottom: 'calc(50% + 10px)',
  width: '20%',
  padding: '0 0.5rem 10px 0.5rem',
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: 'block',
  },
}));

const Box2 = styled('div')(({ theme }) => ({
  position: 'fixed',
  overflowY: 'auto',
  left: '0',
  top: '50%',
  bottom: '0',
  width: '20%',
  padding: '0 0.5rem',
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: 'block',
  },
}));

const Box3 = styled('div')(({ theme }) => ({
  position: 'fixed',
  overflowY: 'auto',
  right: '0',
  top: '4rem',
  bottom: '0',
  width: '20%',
  padding: '0 0.5rem',
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: 'block',
  },
}));

interface PropertiesHeaderProps extends GeneralProps {
  name: string | { [key: string]: string };
  onDelete?: () => void;
}
function PropertiesHeader(props: PropertiesHeaderProps) {
  return (
    <SectionName
      text={TransName(props.name)}
      endElement={
        !!props.onDelete && (
          <IconButton size="small" color="error" onClick={props.onDelete}>
            <FontAwesomeIcon icon={faTrash} />
          </IconButton>
        )
      }
    />
  );
}

function Properties(props: GeneralProps) {
  if (!props.selected) {
    return (
      <>
        <PropertiesHeader {...props} name={Trans('report')} />
        <ReportSettings {...props} />
      </>
    );
  }

  function remove() {
    if (!props.selected) {
      return;
    }
    const report = removeFromList(props.report, props.selected);
    props.setReport(report);
    props.setSelected(null);
  }

  const wid = props.selected;
  const selected = findInList(props.report, wid);
  const comp = getWidget(props.widgets, selected.type);
  if (!comp.RenderProperties) {
    return <PropertiesHeader {...props} name={comp.name} onDelete={remove} />;
  }
  return (
    <>
      <PropertiesHeader {...props} name={comp.name} onDelete={remove} />
      <comp.RenderProperties
        {...props}
        item={selected}
        setItem={(itm: Item) => {
          const r2 = updateItem(props.report, wid, itm);
          return props.setReport(r2);
        }}
        wid={props.selected}
      />
    </>
  );
}

function RenderContent(props: GeneralProps) {
  const t = props.report.target;
  if (t === 'pdf' || t === 'html') {
    const style = {
      ...defaultReportCss,
      ...PropertyFontGenCss(props.report.properties.font || {}),
    };
    const fontStyle = props.report.properties.font
      ? PropertyFontExtractStyle(props.report.properties.font)
      : undefined;
    if (fontStyle) {
      LoadGoogleFontCss(fontStyle);
    }
    let width = props.report.properties.paperWidth || 210;
    style.maxWidth = `${(width * 800) / 210}px`;
    style.margin = `0 auto`;
    return (
      <div style={style}>
        {props.renderWidgets(props.report.children, [])}
        {props.report.children.length === 0 && (
          <Typography color="GrayText" align="center">
            {Trans('drag drop widgets here')}
          </Typography>
        )}
      </div>
    );
  }

  if (t === 'json') {
    try {
      const content = JSON.stringify(props.data.data);
      return <pre>{content}</pre>;
    } catch (e) {
      return (
        <Alert severity="error">
          <AlertTitle>{Trans('error')}</AlertTitle>
          {String(e)}
        </Alert>
      );
    }
  }

  if (t === 'csv-utf-8' || t === 'csv-windows-1250') {
    const dt = props.data.data;
    if (!Array.isArray(dt)) {
      return (
        <Alert severity="error">
          <AlertTitle>{Trans('error')}</AlertTitle>
          {Trans('data must be 2D array')}
        </Alert>
      );
    }
    return (
      <Table>
        <TableBody>
          {dt.map((row, idx) => (
            <TableRow key={idx}>
              {Array.isArray(row) &&
                row.map((cell, idx2) => (
                  <TableCell key={idx2}>{String(cell)}</TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  throw new Error('unknown target');
}

export default function Layout(
  props: GeneralProps & {
    dragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  },
) {
  function resetSelection(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault();
    e.stopPropagation();
    props.setSelected(null);
  }

  function keyDownHandler(e: React.KeyboardEvent<HTMLDivElement>) {
    if ((e.key === 'Backspace' || e.key === 'Delete') && props.selected) {
      // delete selected
      e.preventDefault();
      e.stopPropagation();
      const r = removeFromList(props.report, props.selected);
      props.setSelected(null);
      props.setReport(r);
    }
  }

  // drag-drop source data
  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!props.setSourceDataOverride) {
      return;
    }
    const arr = extractFiles(e.dataTransfer);
    if (arr.length === 0) {
      return;
    }
    const f = arr[0];
    try {
      const reader = new FileReader();
      reader.onload = e2 => {
        if (!e2.target || typeof e2.target.result !== 'string') {
          return;
        }
        const dt = JSON.parse(e2.target.result);
        if (props.setSourceDataOverride) {
          props.setSourceDataOverride(dt);
        }
      };
      reader.readAsText(f);
    } catch (e) {
      alert(`Error: ${String(e)}`);
      return;
    }
  }

  return (
    <>
      <BoxMenu elevation={0}>
        <EditorMenu {...props} />
      </BoxMenu>
      <Box1>
        <Stack spacing={2}>
          <div />
          <EditWidgetNew {...props} />
          <div />
        </Stack>
      </Box1>
      <Box2 onDragOver={onDragOver} onDrop={onDrop}>
        <Stack spacing={2}>
          <div />
          <DataTransform {...props} />
          <Divider />
          {props.data.errorMsg ? (
            <div>{props.data.errorMsg}</div>
          ) : (
            <div>
              <ObjectExplorer data={props.data.data} />
            </div>
          )}
          <div />
        </Stack>
      </Box2>
      <Box3>
        <Stack spacing={2}>
          <div />
          <Properties {...props} />
          <div />
        </Stack>
      </Box3>
      <BoxMain
        onClick={resetSelection}
        onDragOver={props.dragOver}
        onDrop={e => props.drop(e, [props.report.children.length])}
        tabIndex={0}
        onKeyDown={keyDownHandler}
      >
        <div>
          <RenderContent {...props} />
        </div>
      </BoxMain>
    </>
  );
}
