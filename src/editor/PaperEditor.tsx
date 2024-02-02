/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2024
 * @license MIT
 */

import React from 'react';
import type { Paper } from '../types';
import Property4SideInput, {
  Value as Property4SideInputValue,
} from '../widgets/Property4SideInput';
import SectionName from '../components/SectionName';
import trans from '../translation';
import InputApplyOnEnter from '../components/InputApplyOnEnter';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const inputAdornmentMm = {
  endAdornment: <InputAdornment position="end">mm</InputAdornment>,
};
const inputAdornmentInch = {
  endAdornment: <InputAdornment position="end">inch</InputAdornment>,
};

type Units = 'mm' | 'inch';
const factors: { [key in Units]: number } = {
  mm: 1,
  inch: 25.4,
};

function ConvertFromMm(value: number, unit: Units): number {
  return value / factors[unit];
}

function ConvertFromMmArray<T extends number[]>(value: T, unit: Units): T {
  return value.map(x => ConvertFromMm(x, unit)) as T;
}

function ConvertToMm(value: number, unit: Units): number {
  return value * factors[unit];
}

function ConvertToMmArray<T extends number[]>(value: T, unit: Units): T {
  return value.map(x => ConvertToMm(x, unit)) as T;
}

interface PaperEditorProps {
  value: Paper;
  onChange: (val: Paper) => void;
  unit: Units;
}

export default function PaperEditor(props: PaperEditorProps) {
  function changeProperty(key: 'width' | 'height', value: number) {
    const obj = { ...props.value };
    if (value) {
      obj[key] = ConvertToMm(value, props.unit);
    } else {
      delete obj[key];
    }
    props.onChange(obj);
  }

  async function changeMargin(value: Property4SideInputValue) {
    props.onChange({
      ...props.value,
      margin: ConvertToMmArray(value, props.unit),
    });
  }

  const width = ConvertFromMm(props.value.width || 0, props.unit);
  const height = ConvertFromMm(props.value.height || 0, props.unit);
  const margin: Property4SideInputValue = ConvertFromMmArray(
    props.value.margin ? props.value.margin : [0, 0, 0, 0],
    props.unit,
  );

  return (
    <>
      <SectionName
        text={trans('paper')}
        secondaryText={trans('0 means default')}
      />

      <InputApplyOnEnter
        component={TextField}
        value={width}
        onChange={val => changeProperty('width', val as number)}
        type="number"
        label={trans('width')}
        id="paperWidth"
        InputProps={props.unit === 'mm' ? inputAdornmentMm : inputAdornmentInch}
      />

      <InputApplyOnEnter
        component={TextField}
        value={height}
        onChange={val => changeProperty('height', val as number)}
        type="number"
        label={trans('height')}
        id="paperHeight"
        InputProps={props.unit === 'mm' ? inputAdornmentMm : inputAdornmentInch}
      />

      <SectionName text={trans('margin')} secondaryText={props.unit} />
      <Property4SideInput value={margin} onChange={changeMargin} />
    </>
  );
}
