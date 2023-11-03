/**
 * @file Panel of available widgets to build a report.
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React, { useEffect, useState } from 'react';
import Trans, { TransName } from '../translation';
import { Report, ApiReportMetaData } from '../types';
import { Widget, GeneralProps, ItemNewProps } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import SectionName from '../components/SectionName';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';

function ShowReports(props: GeneralProps) {
  const [allReports, setAllReports] = useState<ApiReportMetaData[]>([]);
  useEffect(() => {
    if (props.api.allReports) {
      props.api.allReports().then(arr => setAllReports(arr));
    }
  }, [props.api]);

  async function dragStartReport(
    e: React.DragEvent<HTMLDivElement>,
    id: string,
  ) {
    if (!props.api.reportGet) {
      return;
    }
    let js: Report;
    try {
      js = await props.api.reportGet(id);
    } catch (e) {
      alert(String(e));
      return;
    }
    return props.dragWidgetStart(e, { type: 'widgets', widgets: js.children });
  }

  if (allReports.length === 0) {
    return (
      <>
        <Typography color="GrayText">{Trans('empty')}</Typography>
      </>
    );
  }
  return (
    <>
      {allReports.map(r => (
        <ListItem disablePadding key={r.id}>
          <ListItemButton
            disableRipple
            draggable
            onDragStart={e => dragStartReport(e, r.id)}
            onDragEnd={props.dragWidgetEnd}
            sx={{ py: 0.2 }}
          >
            <ListItemIcon>
              <FontAwesomeIcon icon={faFileAlt} fixedWidth />
            </ListItemIcon>
            <ListItemText primary={TransName(r.name)} />
          </ListItemButton>
        </ListItem>
      ))}
    </>
  );
}

function ShowWidgets(props: GeneralProps) {
  async function dragStartWidget(e: React.DragEvent<HTMLElement>, w: Widget) {
    const propsNewItem: ItemNewProps = {
      report: props.report,
    };
    const obj = await w.newItem(propsNewItem);
    return props.dragWidgetStart(e, { type: 'widget', widget: obj });
  }

  return (
    <List disablePadding>
      {props.widgets.map(w => {
        if (typeof w.canAdd !== 'undefined' && !w.canAdd) {
          return null;
        }
        return (
          <Tooltip
            key={w.id}
            title={Trans('drag drop widgets')}
            placement="left-start"
          >
            <ListItem disablePadding>
              <ListItemButton
                disableRipple
                draggable
                onDragStart={e => dragStartWidget(e, w)}
                onDragEnd={e => props.dragWidgetEnd(e)}
                sx={{ py: 0.2 }}
              >
                <ListItemIcon>
                  <FontAwesomeIcon icon={w.icon} fixedWidth />
                </ListItemIcon>
                <ListItemText primary={TransName(w.name)} />
              </ListItemButton>
            </ListItem>
          </Tooltip>
        );
      })}
    </List>
  );
}

export default function EditWidgetNew(props: GeneralProps) {
  if (props.report.target !== 'pdf' && props.report.target !== 'html') {
    return (
      <Typography color="GrayText">
        <small>
          {Trans('no widgets available for target -name-', [
            props.report.target,
          ])}
        </small>
      </Typography>
    );
  }
  return (
    <>
      <SectionName text={Trans('widgets')} />
      <ShowWidgets {...props} />

      {!!props.api.allReports && (
        <>
          <SectionName text={Trans('reports')} />
          <ShowReports {...props} />
        </>
      )}
    </>
  );
}
