/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { CSSProperties } from 'react';
import type { Item, ItemCompiled, Widget } from './types';
import { faBorderStyle } from '@fortawesome/free-solid-svg-icons';
import PropertyColor from './PropertyColor';
import PropertyBorder, { Border, genBorderCss } from './PropertyBorder';
import BoxName from './BoxName';
import Trans from '../translation';
import InputApplyOnEnter, {
  WidthOptions,
  WidthRegex,
} from './InputApplyOnEnter';
import PropertyFont, {
  PropertyFontExtractStyle,
  PropertyFontGenCss,
  TFont,
} from './PropertyFont';
import { LoadGoogleFontCss } from './GoogleFonts';
import useStateDelayed from '../useStateDelayed';
import SectionName from '../components/SectionName';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

interface Properties {
  margin: [number, number, number, number];
  padding: [number, number, number, number];
  border: Border | [Border, Border, Border, Border];
  width: string;
  height: string;
  backgroundColor?: string;
  pageBreakAvoid?: boolean;
  font: TFont;
}
export type FrameData = Item & Properties;
export type FrameCompiled = ItemCompiled &
  Properties & { children: ItemCompiled[] };

function genStyle(
  item: FrameData | FrameCompiled,
  final: boolean,
): CSSProperties {
  const css: CSSProperties = {
    margin: `${item.margin[0]}px ${item.margin[1]}px ${item.margin[2]}px ${item.margin[3]}px`,
    padding: `${item.padding[0]}px ${item.padding[1]}px ${item.padding[2]}px ${item.padding[3]}px`,
    boxSizing: 'border-box',
    width: 'auto', // in preview, to override width:100%
  };

  if (Array.isArray(item.border)) {
    css.borderTop = genBorderCss(item.border[0]);
    css.borderRight = genBorderCss(item.border[1]);
    css.borderBottom = genBorderCss(item.border[2]);
    css.borderLeft = genBorderCss(item.border[3]);
  }
  //
  else {
    css.border = genBorderCss(item.border);
  }
  if (item.backgroundColor) {
    css.backgroundColor = item.backgroundColor;
  }

  if (final) {
    if (item.width.length > 0) {
      css.width = item.width;
      css.flex = `0 0 ${item.width}`;
      css.overflowX = 'hidden';
    }
    if (item.height.length > 0) {
      css.height = item.height;
      css.overflowY = 'hidden';
    }
  }
  //
  else {
    if (item.width.length > 0) {
      css.width = item.width;
    }
    if (item.height.length > 0) {
      css.minHeight = item.height;
    }
  }

  if (item.pageBreakAvoid) {
    css.pageBreakInside = 'avoid';
  }

  const cssFont = PropertyFontGenCss(item.font);
  Object.assign(css, cssFont);

  return css;
}

type Property4SideRangeValue = [number, number, number, number];
interface Property4SideRangeProps {
  id: string;
  label: string;
  min: number;
  max: number;
  value: Property4SideRangeValue;
  onChange: (val: Property4SideRangeValue) => void;
}
function Property4SideRange(props: Property4SideRangeProps) {
  const [value, setValue] = useStateDelayed<Property4SideRangeValue>(
    props.value,
    props.onChange,
  );

  function renderInput(idx: number) {
    const st: CSSProperties = {
      width: '50%',
      margin: '0 0.2rem',
    };
    function setValueInput(val: number, delay: number) {
      const arr: Property4SideRangeValue = [...value];
      arr[idx] = val;
      return setValue(arr, delay);
    }
    return (
      <Slider
        id={`${props.id}-${idx}`}
        style={st}
        min={props.min}
        max={props.max}
        value={value[idx]}
        onChange={(e, newVal) => setValueInput(newVal as number, 300)}
      />
    );
  }

  return (
    <>
      <SectionName
        text={props.label}
        secondaryText={`${value[0]}, ${value[1]}, ${value[2]}, ${value[3]} px`}
      />
      <div>
        <div style={{ textAlign: 'center' }}>{renderInput(0)}</div>
        <Stack direction="row">
          {renderInput(3)}
          {renderInput(1)}
        </Stack>
        <div style={{ textAlign: 'center' }}>{renderInput(2)}</div>
      </div>
    </>
  );
}

export const Frame: Widget = {
  id: 'Frame',
  name: { en: 'Frame', sl: 'Okvir' },
  icon: faBorderStyle,

  newItem: async (): Promise<FrameData> => {
    return {
      type: 'Frame',
      children: [],
      margin: [0, 0, 0, 0],
      padding: [0, 0, 0, 0],
      border: {
        width: 1,
        style: 'solid',
        color: '#333333',
      },
      width: '',
      height: '',
      font: {},
    };
  },

  compile: async (dt: FrameData, helpers): Promise<FrameCompiled> => {
    const dt2: FrameCompiled = JSON.parse(
      JSON.stringify({ ...dt, children: [] }),
    );
    const style = PropertyFontExtractStyle(dt.font);
    if (style) {
      helpers.reportCompiled.fontsUsed.push(style);
    }
    dt2.children = await helpers.compileChildren(dt.children, helpers);
    return dt2;
  },

  RenderEditor: function (props) {
    const item = props.item as FrameData;
    const fontStyle = PropertyFontExtractStyle(item.font);
    if (fontStyle) {
      LoadGoogleFontCss(fontStyle);
    }
    return (
      <BoxName {...props} style={genStyle(item, false)} name={Frame.name}>
        {props.renderWidgets(item.children, props.wid)}
      </BoxName>
    );
  },

  RenderPreview: function (props) {
    const item = props.item as FrameCompiled;
    const style = genStyle(item, true);
    return (
      <div style={style}>{props.renderChildren(item.children, props)}</div>
    );
  },

  RenderProperties: function (props) {
    const item = props.item as FrameData;
    return (
      <>
        <SizeInput
          type="width"
          value={item.width || ''}
          onChange={val => props.setItem({ ...item, width: String(val) })}
        />
        <SizeInput
          type="height"
          value={item.height || ''}
          onChange={val => props.setItem({ ...item, height: String(val) })}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={!!item.backgroundColor}
              onChange={e => {
                const obj: FrameData = { ...item };
                if (e.target.checked) {
                  obj.backgroundColor = '#FFCCCC';
                } else {
                  delete obj.backgroundColor;
                }
                props.setItem(obj);
              }}
            />
          }
          label={Trans('background')}
        />
        {!!item.backgroundColor && (
          <PropertyColor
            value={item.backgroundColor}
            onChange={val => props.setItem({ ...item, backgroundColor: val })}
          />
        )}

        <Property4SideRange
          id="Frame-margin"
          label={Trans('margin')}
          min={0}
          max={80}
          value={item.margin}
          onChange={val => props.setItem({ ...props.item, margin: val })}
        />

        <Property4SideRange
          id="Frame-padding"
          label={Trans('padding')}
          min={0}
          max={80}
          value={item.padding}
          onChange={val => props.setItem({ ...props.item, padding: val })}
        />

        <SectionName text={Trans('border')} />

        <FormControlLabel
          control={
            <Checkbox
              checked={Array.isArray(item.border)}
              onChange={e => {
                const obj: FrameData = { ...item };
                if (e.target.checked) {
                  const brd: Border = !Array.isArray(item.border)
                    ? item.border
                    : { width: 1, color: '#cccccc', style: 'solid' };
                  obj.border = [{ ...brd }, { ...brd }, { ...brd }, { ...brd }];
                } else {
                  obj.border = { width: 1, color: '#cccccc', style: 'solid' };
                }
                props.setItem(obj);
              }}
            />
          }
          label={Trans('border different sides')}
        />

        {Array.isArray(item.border) &&
          ['top', 'right', 'bottom', 'left'].map((side2, idx) => {
            const side = side2 as 'top' | 'right' | 'bottom' | 'left';
            const val2 = Array.isArray(item.border)
              ? item.border
              : [item.border, item.border, item.border, item.border];
            return (
              <React.Fragment key={side}>
                <SectionName text={Trans(`border-${side}`)} />
                <PropertyBorder
                  id={`Frame-border-${side}`}
                  value={val2[idx]}
                  onChange={val => {
                    const arr = [...val2];
                    arr[idx] = val;
                    props.setItem({ ...item, border: arr });
                  }}
                />
              </React.Fragment>
            );
          })}
        {!Array.isArray(item.border) && (
          <PropertyBorder
            id={`Frame-border-full`}
            value={item.border}
            onChange={val => props.setItem({ ...item, border: val })}
          />
        )}

        <SectionName text={Trans('other')} />
        <PropertyFont
          value={item.font}
          onChange={val => props.setItem({ ...props.item, font: val })}
          googleFontApiKey={props.api.googleFontApiKey}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={!!item.pageBreakAvoid}
              onChange={e => {
                const obj: FrameData = { ...item };
                obj.pageBreakAvoid = e.target.checked;
                props.setItem(obj);
              }}
            />
          }
          label={Trans('page-break-avoid')}
        />
      </>
    );
  },
};

interface SizeInputProps {
  value: string | number;
  onChange: (val: string | number) => void;
  type: 'width' | 'height';
}

function SizeInput(props: SizeInputProps) {
  const id = `Frame-${props.type}`;
  return (
    <FormControl fullWidth>
      <InputLabel htmlFor={id}>
        {Trans(props.type)}
        <Typography component="span" sx={{ marginLeft: 0.25 }}>
          <small>[{WidthOptions}]</small>
        </Typography>
      </InputLabel>
      <InputApplyOnEnter
        component={OutlinedInput}
        value={props.value}
        onChange={x => props.onChange(x)}
        regex={WidthRegex}
        id={id}
      />
    </FormControl>
  );
}
