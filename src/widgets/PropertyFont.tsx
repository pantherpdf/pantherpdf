/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import React, { useState, CSSProperties } from 'react';
import trans from '../translation';
import PropertyColor from './PropertyColor';
import InputApplyOnEnter, {
  WidthRegex,
  WidthOptions,
} from '../components/InputApplyOnEnter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFont } from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Secondary from '../components/Secondary';
import { ApiEndpoints } from '../types';

// prettier-ignore
type Narrowable = string | number | boolean | symbol | object | NonNullable<unknown> | void | null | undefined;
const tuple = <T extends Narrowable[]>(...args: T) => args;

// could use csstype, but FontWeight has includes [number] instead of hard coded string numbers
// import type { Property } from 'csstype'     Property.FontWeight
// prettier-ignore
const WeightOptions = tuple('normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900');
type TWeightOption = (typeof WeightOptions)[number];

const StyleOptions = tuple('normal', 'italic');
type TStyleOption = (typeof StyleOptions)[number];

export interface TFont {
  family?: string;
  size?: string;
  weight?: TWeightOption;
  style?: TStyleOption;
  color?: string;
  lineHeight?: number;
}

export interface FontStyle {
  name: string;
  weight: number;
  italic: boolean;
}

const weightName: { [key in TWeightOption]: string } = {
  normal: trans('font-weight-normal'),
  bold: trans('font-weight-bold'),
  '100': '100',
  '200': '200',
  '300': '300',
  '400': '400',
  '500': '500',
  '600': '600',
  '700': '700',
  '800': '800',
  '900': '900',
};

const WeightOptionToNumeric: { [key in TWeightOption]: number } = {
  normal: 400,
  bold: 700,
  '100': 100,
  '200': 200,
  '300': 300,
  '400': 400,
  '500': 500,
  '600': 600,
  '700': 700,
  '800': 800,
  '900': 900,
};

const styleName: { [key in TStyleOption]: string } = {
  normal: trans('font-style-normal'),
  italic: trans('font-style-italic'),
};

const lineHeightOptions: { txt: string; value: number }[] = [
  { txt: '66%', value: 0.666 },
  { txt: '90%', value: 0.9 },
  { txt: '100%', value: 1.0 },
  { txt: '115%', value: 1.15 },
  { txt: '150%', value: 1.5 },
  { txt: '200%', value: 2.0 },
];

export function PropertyFontGenCss(obj: TFont): CSSProperties {
  const css: CSSProperties = {};
  if (obj.family) {
    css.fontFamily = obj.family + ', sans-serif';
  }
  if (obj.size) {
    css.fontSize = obj.size;
    if (typeof obj.lineHeight !== 'undefined') {
      const found = obj.size.match(/^\d*/gm);
      const txtDigits = found && found.length > 0 ? found[0] : '';
      const sizeInt = parseInt(txtDigits);
      const ext = obj.size.substring(txtDigits.length);
      css.lineHeight = `${sizeInt * obj.lineHeight * 1.25}${ext}`;
    }
  }
  if (obj.weight && obj.weight.length > 0) {
    const weightNum = parseInt(obj.weight);
    if (isFinite(weightNum)) {
      css.fontWeight = weightNum;
    } else {
      css.fontWeight = obj.weight;
    }
  }
  if (obj.style && obj.style.length > 0) {
    css.fontStyle = obj.style;
  }
  if (obj.color) {
    css.color = obj.color;
  }
  return css;
}

export function propertyFontExtractStyle(obj: TFont): FontStyle | undefined {
  if (!obj.family) {
    return undefined;
  }
  const w = obj.weight || 'normal';
  return {
    name: obj.family,
    weight: WeightOptionToNumeric[w],
    italic: obj.style === 'italic',
  };
}

interface Props {
  api: ApiEndpoints;
  value: TFont;
  onChange: (obj: TFont) => void;
  textButton?: boolean;
  iconButton?: boolean;
  id?: string;
}
export default function PropertyFont(props: Props) {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  function handleInputChange(name: keyof TFont, value: string) {
    let obj: TFont;
    if (value === '') {
      obj = { ...props.value };
      delete obj[name];
    } else {
      obj = { ...props.value, [name]: value };
    }
    props.onChange(obj);
  }

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    setAnchorEl(e.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function renderBtn() {
    if (props.textButton) {
      return (
        <Button variant="text" onClick={handleClick}>
          {trans('font')}
        </Button>
      );
    }

    if (props.iconButton) {
      return (
        <Button variant="text" onClick={handleClick} title={trans('font')}>
          <FontAwesomeIcon icon={faFont} fixedWidth />
        </Button>
      );
    }

    return (
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleClick}
        startIcon={<FontAwesomeIcon icon={faFont} />}
      >
        {trans('font')}
      </Button>
    );
  }

  const family = props.value.family || '';
  const size = props.value.size || '';
  const lineHeight = props.value.lineHeight || 0;
  const weight = props.value.weight || '';
  const style = props.value.style || '';
  const color = props.value.color || '';

  return (
    <>
      {renderBtn()}

      <Popover
        id={props.id || ''}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Stack direction="column" spacing={2} sx={{ p: 2 }}>
          <TextField
            select
            id="family"
            label={trans('font-family')}
            value={family}
            onChange={e => handleInputChange('family', e.target.value)}
            fullWidth
          >
            <MenuItem value="">
              <Secondary>{trans('inherit')}</Secondary>
            </MenuItem>
            {props.api.fonts?.list.map(fontName => (
              <MenuItem value={fontName} key={fontName}>
                {fontName}
              </MenuItem>
            ))}
          </TextField>
          <InputApplyOnEnter
            component={TextField}
            value={size}
            onChange={val => handleInputChange('size', val)}
            id="size"
            regex={WidthRegex}
            label={trans('font-size')}
            helperText={WidthOptions}
          />
          {size.length > 0 && (
            <TextField
              select
              id="lineHeight"
              value={lineHeight}
              onChange={e => {
                const val = e.target.value;
                let obj: TFont;
                if (val === '') {
                  obj = { ...props.value };
                  delete obj.lineHeight;
                } else {
                  obj = { ...props.value, lineHeight: parseFloat(val) };
                }
                props.onChange(obj);
              }}
              label={trans('font-line-height')}
            >
              <MenuItem value="">
                <Secondary>{trans('inherit')}</Secondary>
              </MenuItem>
              {lineHeightOptions.map(w => (
                <MenuItem value={w.value} key={w.value}>
                  {w.txt}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            select
            id="weight"
            value={weight}
            onChange={e => handleInputChange('weight', e.target.value)}
            label={trans('font-weight')}
          >
            <MenuItem value="">
              <Secondary>{trans('inherit')}</Secondary>
            </MenuItem>
            {WeightOptions.map(w => (
              <MenuItem value={w} key={w}>
                {weightName[w]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            id="style"
            value={style}
            onChange={e => handleInputChange('style', e.target.value)}
            label={trans('font-style')}
          >
            <MenuItem value="">
              <Secondary>{trans('inherit')}</Secondary>
            </MenuItem>
            {StyleOptions.map(w => (
              <MenuItem value={w} key={w}>
                {styleName[w]}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Checkbox
                checked={color.length > 0}
                onChange={e =>
                  handleInputChange('color', e.target.checked ? '#000000' : '')
                }
              />
            }
            label={trans('color')}
          />
          {color.length > 0 && (
            <PropertyColor
              value={color}
              onChange={val => props.onChange({ ...props.value, color: val })}
            />
          )}
        </Stack>
      </Popover>
    </>
  );
}
