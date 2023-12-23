/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { CSSProperties } from 'react';
import type { Widget, Item, ItemCompiled } from './types';
import { faColumns, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import BoxName from './BoxName';
import InputApplyOnEnter, {
  WidthRegex,
  WidthOptions,
} from './InputApplyOnEnter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Trans from '../translation';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

export interface ColumnsCtData extends Item {
  type: 'ColumnsCt';
}

export interface ColumnsCtCompiled extends ItemCompiled {
  type: 'ColumnsCt';
  children: ItemCompiled[];
}

export const ColumnsCt: Widget = {
  id: 'ColumnsCt',
  name: { en: 'ColumnsCt', sl: 'StolpciCt' },
  icon: faColumns,

  newItem: async (): Promise<ColumnsCtData> => {
    return {
      type: 'ColumnsCt',
      children: [],
    };
  },

  compile: async (dt: ColumnsCtData, helper): Promise<ColumnsCtCompiled> => {
    return {
      type: dt.type,
      children: await helper.compileChildren(dt.children, helper),
    };
  },

  RenderEditor: function (props) {
    // handled by Columns
    return null;
  },

  RenderPreview: function (props) {
    // handled by Columns
    return null;
  },

  RenderProperties: function () {
    return null;
  },

  canAdd: false,
  canSelect: false,
  canDrag: false,
};

export interface ColumnsData extends Item {
  type: 'Columns';
  widths: string[];
}

export interface ColumnsCompiled extends ItemCompiled {
  type: 'Columns';
  widths: string[];
  children: ColumnsCtCompiled[];
}

function colStyle(w: string): CSSProperties {
  if (w && w.length > 0) {
    if (w.match(/^-{0,1}\d+$/)) {
      return {
        flex: `${w} 1 auto`,
      };
    } else {
      return {
        flex: `0 0 ${w}`,
        minWidth: w,
        maxWidth: w,
      };
    }
  }
  return {
    flex: '1 1 auto',
  };
}

export const Columns: Widget = {
  id: 'Columns',
  name: { en: 'Columns', sl: 'Stolpci' },
  icon: faColumns,

  newItem: async (props): Promise<ColumnsData> => {
    return {
      type: 'Columns',
      children: [
        await ColumnsCt.newItem({ report: props.report }),
        await ColumnsCt.newItem({ report: props.report }),
        await ColumnsCt.newItem({ report: props.report }),
      ],
      widths: ['', '', ''],
    };
  },

  compile: async (dt: ColumnsData, helper): Promise<ColumnsCompiled> => {
    return {
      type: dt.type,
      children: (await helper.compileChildren(
        dt.children,
        helper,
      )) as ColumnsCtCompiled[],
      widths: dt.widths,
    };
  },

  RenderEditor: function (props) {
    const item = props.item as ColumnsData;
    const baseStyle: CSSProperties = {
      border: '1px solid #ccc',
    };
    return (
      <BoxName {...props} name={Columns.name}>
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
          }}
        >
          {item.children.map((ch, idx) => (
            <div
              key={idx}
              style={{ ...baseStyle, ...colStyle(item.widths[idx]) }}
              onDrop={e =>
                props.drop(e, [...props.wid, idx, ch.children.length])
              }
            >
              {props.renderWidgets(ch.children, [...props.wid, idx])}
            </div>
          ))}
        </div>
      </BoxName>
    );
  },

  RenderPreview: function (props) {
    const item = props.item as ColumnsCompiled;
    return (
      <div style={{ display: 'flex' }}>
        {item.children.map((ch, idx) => {
          const style = colStyle(item.widths[idx]);
          return (
            <div key={idx} style={style}>
              {props.renderChildren(ch.children, { ...props })}
            </div>
          );
        })}
      </div>
    );
  },

  RenderProperties: function (props) {
    const item = props.item as ColumnsData;
    if (item.children.length !== item.widths.length) {
      throw new Error(
        `Columns: property children and widths have different length ${item.children.length} vs ${item.widths.length}`,
      );
    }
    return (
      <>
        <div>
          {Trans('width')}
          <br />
          <Typography color="GrayText">
            <small>
              {WidthOptions}
              <br />
              {Trans('columns - empty = auto')}
            </small>
          </Typography>
        </div>
        {item.widths.map((w, idx) => (
          <Paper key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
            <InputApplyOnEnter
              component={InputBase}
              id={`Columns-width-${idx}`}
              value={w}
              onChange={val => {
                const arr = [...item.widths];
                arr[idx] = String(val);
                props.setItem({ ...item, widths: arr });
              }}
              regex={WidthRegex}
              sx={{ ml: 1, flex: 1 }}
            />
            <IconButton
              onClick={() => {
                const ws = [...item.widths];
                const chs = [...item.children];
                ws.splice(idx, 1);
                chs.splice(idx, 1);
                props.setItem({ ...item, widths: ws, children: chs });
              }}
              title={Trans('remove')}
            >
              <FontAwesomeIcon icon={faTimes} />
            </IconButton>
          </Paper>
        ))}
        <div>
          <Button
            color="secondary"
            variant="outlined"
            onClick={async () => {
              const ws = [...item.widths, ''];
              const chs = [
                ...item.children,
                await ColumnsCt.newItem({ report: props.report }),
              ];
              props.setItem({ ...item, widths: ws, children: chs });
            }}
            startIcon={<FontAwesomeIcon icon={faPlus} />}
          >
            {Trans('columns add')}
          </Button>
        </div>
      </>
    );
  },
};
