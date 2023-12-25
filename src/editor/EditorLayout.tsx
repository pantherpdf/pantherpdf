/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import type { WidgetItem } from '../widgets/types';
import type { GeneralProps } from './types';
import trans, { transName } from '../translation';

import EditorMenu from './EditorMenu';
import DataTransform from './DataTransform';
import EditWidgetNew from './EditWidgetNew';
import { getWidget } from '../widgets/allWidgets';
import { findInList, removeFromList, updateItem } from './childrenMgmt';
import ReportSettings from './ReportSettings';
import { extractFiles } from '../FileSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import SectionName from '../components/SectionName';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Paper';
import TransformedDataExplorer from './TransformedDataExplorer';
import EditorContent from './EditorContent';

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
      text={transName(props.name)}
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
        <PropertiesHeader {...props} name={trans('report')} />
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
  if (!comp.Properties) {
    return <PropertiesHeader {...props} name={comp.name} onDelete={remove} />;
  }
  return (
    <>
      <PropertiesHeader {...props} name={comp.name} onDelete={remove} />
      <comp.Properties
        {...props}
        item={selected}
        setItem={(itm: WidgetItem) => {
          const r2 = updateItem(props.report, wid, itm);
          return props.setReport(r2);
        }}
        wid={props.selected}
      />
    </>
  );
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
        props.setSourceDataOverride({
          type: 'json',
          value: e2.target.result,
        });
      };
      reader.readAsText(f);
    } catch (e) {
      alert(`Error: ${String(e)}`);
      return;
    }
  }

  return (
    <div data-testid="pantherpdf">
      <BoxMenu elevation={0} data-testid="navbar">
        <EditorMenu {...props} />
      </BoxMenu>
      <Box1 data-testid="widgets">
        <Stack spacing={2}>
          <div />
          <EditWidgetNew {...props} />
          <div />
        </Stack>
      </Box1>
      <Box2 onDragOver={onDragOver} onDrop={onDrop} data-testid="source-data">
        <Stack spacing={2}>
          <div />
          <DataTransform {...props} />
          <Divider />
          <TransformedDataExplorer {...props} />
          <div />
        </Stack>
      </Box2>
      <Box3 data-testid="properties">
        <Stack spacing={2}>
          <div />
          <Properties {...props} />
          <div />
        </Stack>
      </Box3>
      <BoxMain
        onClick={resetSelection}
        onDragOver={props.dragOver}
        onDrop={e => props.drop(e, [props.report.widgets.length])}
        tabIndex={0}
        onKeyDown={keyDownHandler}
        data-testid="content"
      >
        <div>
          <EditorContent {...props} />
        </div>
      </BoxMain>
    </div>
  );
}
