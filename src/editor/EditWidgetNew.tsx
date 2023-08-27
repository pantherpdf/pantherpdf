/**
 * EditWidgetNew.tsx
 * List of available widgets to build a report.
 */

import React, { useEffect, useRef, useState } from 'react';
import Trans, { TransName } from '../translation';
import style from './EditWidgets.module.css';
import { TReport, ApiReportMetaData } from '../types';
import { Widget, GeneralProps, NewItemProps } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Overlay, Tooltip } from 'react-bootstrap';
import globalStyle from '../globalStyle.module.css';

interface ExpandableProps {
  name: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

function Expandable(props: ExpandableProps) {
  const [expanded, setExpanded] = useState(props.defaultExpanded || false);
  return (
    <div>
      <div
        className={`${globalStyle.section} d-flex ${style.header}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="mr-3" style={{ fontSize: '110%' }}>
          <small className="me-2">
            <FontAwesomeIcon icon={expanded ? faMinus : faPlus} fixedWidth />
          </small>
        </span>
        <strong>{props.name}</strong>
      </div>
      {expanded && <div className="pl-2">{props.children}</div>}
    </div>
  );
}

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
    let js: TReport;
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
        <span className="text-muted">{Trans('empty')}</span>
      </>
    );
  }
  return (
    <>
      {allReports.map((r, idx) => (
        <React.Fragment key={idx}>
          <div
            key={idx}
            draggable={true}
            onDragStart={e => dragStartReport(e, r._id)}
            onDragEnd={props.dragWidgetEnd}
            className={style.widget}
          >
            {TransName(r.name)}
          </div>
        </React.Fragment>
      ))}
    </>
  );
}

function ShowWidgets(props: GeneralProps) {
  const target = useRef<HTMLDivElement | null>(null);
  const tooltipTimer = useRef<number>(0);
  const [showTooltipId, setShowTooltipId] = useState<string | null>(null);

  function showTooltip(id: string, el: HTMLDivElement) {
    hideTooltip();
    tooltipTimer.current = window.setTimeout(hideTooltip, 2500);
    target.current = el;
    setShowTooltipId(id);
  }

  function hideTooltip() {
    if (tooltipTimer.current === 0) {
      return;
    }
    clearTimeout(tooltipTimer.current);
    tooltipTimer.current = 0;
    target.current = null;
    setShowTooltipId(null);
  }

  useEffect(() => {
    return () => {
      hideTooltip();
    };
  }, []);

  async function dragStartWidget(
    e: React.DragEvent<HTMLDivElement>,
    w: Widget,
  ) {
    const propsNewItem: NewItemProps = {
      report: props.report,
    };
    const obj = await w.newItem(propsNewItem);
    return props.dragWidgetStart(e, { type: 'widget', widget: obj });
  }

  return (
    <>
      {props.widgets.map(w => {
        if (typeof w.canAdd !== 'undefined' && !w.canAdd) {
          return null;
        }
        return (
          <div
            key={w.id}
            draggable={true}
            onDragStart={e => dragStartWidget(e, w)}
            onDragEnd={e => props.dragWidgetEnd(e)}
            className={`${style.widget} bg`}
            onClick={e => showTooltip(w.id, e.currentTarget)}
          >
            <FontAwesomeIcon
              icon={w.icon.fontawesome}
              fixedWidth
              className="me-2"
            />
            {TransName(w.name)}
          </div>
        );
      })}
      <Overlay target={target.current} show={!!showTooltipId} placement="right">
        {props => (
          <Tooltip id="editWidgetNewWidgetTooltip" {...props}>
            {Trans('drag drop widgets')}
          </Tooltip>
        )}
      </Overlay>
    </>
  );
}

export default function EditWidgetNew(props: GeneralProps) {
  if (props.report.target !== 'pdf' && props.report.target !== 'html') {
    return (
      <div className="text-muted">
        <small>
          {Trans('no widgets available for target -name-', [
            props.report.target,
          ])}
        </small>
      </div>
    );
  }
  return (
    <>
      <div className={globalStyle.section}>{Trans('widgets')}</div>
      <ShowWidgets {...props} />

      {!!props.api.allReports && (
        <Expandable name={Trans('reports')}>
          <ShowReports {...props} />
        </Expandable>
      )}
    </>
  );
}
