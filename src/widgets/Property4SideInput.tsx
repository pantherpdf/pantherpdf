/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React from 'react';
import InputApplyOnEnter from './InputApplyOnEnter';

export type Value = [number, number, number, number];

interface Props {
  value: Value;
  onChange: (val: Value) => void;

  id?: string;
  regex?: RegExp;
  style?: React.CSSProperties;
}

export default function Property4SideInput(props: Props) {
  function renderInput(idx: number) {
    const st = {
      width: '50%',
      display: 'inline',
    };
    return (
      <InputApplyOnEnter
        id={props.id ? `${props.id}-${idx}` : undefined}
        style={st}
        regex={props.regex}
        value={props.value[idx]}
        onChange={val => {
          if (typeof val !== 'number') {
            throw new Error('only number is allowed');
          }
          const arr: Value = [...props.value];
          arr[idx] = val;
          props.onChange(arr);
        }}
      />
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center' }}>{renderInput(0)}</div>
      <div className="d-flex">
        {renderInput(3)}
        {renderInput(1)}
      </div>
      <div style={{ textAlign: 'center' }}>{renderInput(2)}</div>
    </div>
  );
}
