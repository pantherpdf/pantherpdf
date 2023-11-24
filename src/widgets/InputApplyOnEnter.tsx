/**
 * @file Helper form input that calls onChange only when focus is lost or when user presses enter.
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import Trans from '../translation';
import InputAdornment from '@mui/material/InputAdornment';

export const WidthRegex = /^(?:|\d+(?:\.\d+)?(?:mm|cm|in|px|%|rem|em|vw|vh|))$/;
export const WidthOptions = 'mm|cm|in|px|%|rem|em|vw|vh';

type TAllowed = string | number;
type AbstractComponent =
  | keyof JSX.IntrinsicElements
  | React.JSXElementConstructor<any>;
type Props<T extends AbstractComponent> = Omit<
  React.ComponentProps<T>,
  'value' | 'onChange' | 'regex'
> & {
  component: T;
  value: TAllowed;
  onChange: (val: TAllowed) => void;
  regex?: RegExp;
};

export default function InputApplyOnEnter<T extends AbstractComponent>(
  props: Props<T>,
) {
  const Cmp = props.component;
  const props2: any = { ...props };
  delete props2.component;
  delete props2.value;
  delete props2.onChange;
  delete props2.regex;

  const [value, setValue] = useState<string>(String(props.value));
  const [origValue, setOrigValue] = useState<TAllowed>(props.value);

  useEffect(() => {
    setValue(String(props.value));
    setOrigValue(props.value);
  }, [props.value]);

  function applyValue(): boolean {
    let value2: TAllowed;

    // number
    if (typeof props.value === 'number' && value.trim().length === 0) {
      value2 = 0;
    } else if (typeof props.value === 'number') {
      const num =
        Number.isInteger(props.step) && props.step !== 0
          ? parseInt(value)
          : parseFloat(value);
      if (!isFinite(num) || isNaN(num)) {
        return false;
      }
      if (String(num) !== value) {
        return false;
      }
      value2 = num;
    }

    // regex
    else if (props.regex) {
      const regexOk = props.regex.test(value);
      if (value !== origValue && !regexOk) {
        return false;
      }
      value2 = value;
    }

    // string
    else {
      value2 = value;
    }

    // apply
    if (value2 !== origValue) {
      props.onChange(value2);
    }
    return true;
  }

  return (
    <Cmp
      {...props2}
      value={value}
      onChange={(e: any) => setValue(e.target.value)}
      onKeyDown={(e: any) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          if (!applyValue()) {
            alert(Trans('invalid value'));
          }
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setValue(String(origValue));
        }
      }}
      onBlur={() => {
        const result = applyValue();
        // allways force old original value
        // in case there is validation outside of this function
        // and it doesnt change value
        // we want to show current value
        // useEffect() will not be called because props.value didnt change
        setValue(String(origValue));
        if (!result) {
          alert(Trans('invalid value'));
        }
      }}
    />
  );
}

export function FAdornment() {
  return (
    <InputAdornment position="start">
      <i>ƒ</i>
    </InputAdornment>
  );
}

export const inputFAdornment = {
  startAdornment: <FAdornment />,
};
