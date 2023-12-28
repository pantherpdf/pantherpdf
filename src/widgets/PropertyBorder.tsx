/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import trans, { trKeys } from '../translation';
import { tuple } from '../types';
import InputApplyOnEnter from '../components/InputApplyOnEnter';
import PropertyColor from './PropertyColor';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

export const TBorderStyles = tuple('dotted', 'dashed', 'solid');
export type TBorderStyle = (typeof TBorderStyles)[number];

const borderData: { type: TBorderStyle; transKey: trKeys }[] = [
  { type: 'solid', transKey: 'border-solid' },
  { type: 'dashed', transKey: 'border-dashed' },
  { type: 'dotted', transKey: 'border-dotted' },
];

export interface Border {
  width: number;
  color: string;
  style: TBorderStyle;
}

export function genBorderCss(b: Border): string {
  return `${b.width}px ${b.style} ${b.color}`;
}

interface BorderEditorProps {
  id?: string;
  value: Border;
  onChange: (value: Border) => void;
}
export default function BorderEditor(props: BorderEditorProps) {
  return (
    <>
      <InputApplyOnEnter
        component={TextField}
        value={props.value.width}
        type="number"
        onChange={val =>
          props.onChange({
            ...props.value,
            width: typeof val === 'number' ? val : 0,
          })
        }
        label={trans('border-width')}
        id={props.id ? `${props.id}-width` : undefined}
      />

      {props.value.width > 0 && (
        <>
          <TextField
            select
            label={trans('border-style')}
            id={props.id ? `${props.id}-style` : undefined}
            value={props.value.style}
            onChange={e =>
              props.onChange({
                ...props.value,
                style: e.target.value as TBorderStyle,
              })
            }
          >
            {borderData.map(s => (
              <MenuItem value={s.type} key={s.type}>
                {trans(s.transKey)}
              </MenuItem>
            ))}
          </TextField>

          <PropertyColor
            value={props.value.color}
            onChange={val => props.onChange({ ...props.value, color: val })}
          />
        </>
      )}
    </>
  );
}
