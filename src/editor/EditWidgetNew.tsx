/**
 * @file Panel of available widgets to build a report.
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { useEffect, useState } from 'react';
import trans, { transName } from '../translation';
import type { Report, ApiReportMetaData } from '../types';
import type { GeneralProps } from './types';
import type { WidgetNewProps, Widget } from '../widgets/types';
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
    return props.dragWidgetStart(e, { type: 'widgets', widgets: js.widgets });
  }

  if (allReports.length === 0) {
    return (
      <>
        <Typography color="GrayText">{trans('empty')}</Typography>
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
            <ListItemText primary={transName(r.name)} />
          </ListItemButton>
        </ListItem>
      ))}
    </>
  );
}

function ShowWidgets(props: GeneralProps) {
  async function dragStartWidget(e: React.DragEvent<HTMLElement>, w: Widget) {
    const propsNewItem: WidgetNewProps = {
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
            title={trans('drag drop widgets')}
            placement="left-start"
          >
            <ListItem disablePadding>
              <ListItemButton
                disableRipple
                draggable
                onDragStart={e => dragStartWidget(e, w)}
                onDragEnd={e => props.dragWidgetEnd(e)}
                sx={{ py: 0.2 }}
                data-testid={w.id}
              >
                <ListItemIcon>
                  <FontAwesomeIcon icon={w.icon} fixedWidth />
                </ListItemIcon>
                <ListItemText primary={transName(w.name)} />
              </ListItemButton>
            </ListItem>
          </Tooltip>
        );
      })}
    </List>
  );
}

export default function EditWidgetNew(props: GeneralProps) {
  return (
    <>
      <SectionName text={trans('widgets')} />
      <ShowWidgets {...props} />

      {!!props.api.allReports && (
        <>
          <SectionName text={trans('reports')} />
          <ShowReports {...props} />
        </>
      )}
    </>
  );
}
