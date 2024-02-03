/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import { InputApplyOnEnterNumber } from '../components/InputApplyOnEnter';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

export type Value = [number, number, number, number];

interface Props {
  value: Value;
  onChange: (val: Value) => void;

  id?: string;
  style?: React.CSSProperties;
}

export default function Property4SideInput(props: Props) {
  function renderInput(idx: number) {
    const st = {
      width: '50%',
      display: 'inline',
    };
    return (
      <InputApplyOnEnterNumber
        component={TextField}
        value={props.value[idx]}
        onChange={val => {
          if (typeof val !== 'number') {
            throw new Error('only number is allowed');
          }
          const arr: Value = [...props.value];
          arr[idx] = val;
          props.onChange(arr);
        }}
        id={props.id ? `${props.id}-${idx}` : undefined}
        style={st}
        size="small"
      />
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center' }}>{renderInput(0)}</div>
      <Stack direction="row">
        {renderInput(3)}
        {renderInput(1)}
      </Stack>
      <div style={{ textAlign: 'center' }}>{renderInput(2)}</div>
    </div>
  );
}
