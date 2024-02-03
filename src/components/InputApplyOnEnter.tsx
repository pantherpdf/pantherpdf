/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import trans from '../translation';
import InputAdornment from '@mui/material/InputAdornment';

export const WidthRegex = /^(?:|\d+(?:\.\d+)?(?:mm|cm|in|px|%|rem|em|vw|vh|))$/;
export const WidthOptions = 'mm|cm|in|px|%|rem|em|vw|vh';

type AbstractComponent =
  | keyof JSX.IntrinsicElements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | React.JSXElementConstructor<any>;
type Props<T extends AbstractComponent, TValue> = Omit<
  React.ComponentProps<T>,
  'value' | 'onChange' | 'regex'
> & {
  component: T;
  value: TValue;
  onChange: (val: TValue) => void;
  disableCommitOnEnter?: boolean; // for multi line text field
};

/**
 * Input field that delays `onChange`.
 * Input field calls `onChange` only when user presses enter or focus is lost.
 * It is a wrapper arround user provided `component`
 */
export default function InputApplyOnEnter<T extends AbstractComponent>(
  props: Props<T, string> & { regex?: RegExp },
) {
  const Cmp = props.component;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props2: any = { ...props };
  delete props2.component;
  delete props2.value;
  delete props2.onChange;
  delete props2.regex;

  const [value, setValue] = useState<string>(props.value);
  const [origValue, setOrigValue] = useState<string>(props.value);

  useEffect(() => {
    setValue(props.value);
    setOrigValue(props.value);
  }, [props.value]);

  function applyValue(): boolean {
    let value2: string;

    // regex
    if (props.regex) {
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
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !props.disableCommitOnEnter) {
          e.preventDefault();
          e.stopPropagation();
          if (!applyValue()) {
            alert(trans('invalid value'));
          }
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setValue(origValue);
        }
      }}
      onBlur={() => {
        const result = applyValue();
        // allways force old original value
        // in case there is validation outside of this function
        // and it doesnt change value
        // we want to show current value
        // useEffect() will not be called because props.value didnt change
        setValue(origValue);
        if (!result) {
          alert(trans('invalid value'));
        }
      }}
    />
  );
}

export function InputApplyOnEnterNumber<T extends AbstractComponent>(
  props: Props<T, number>,
) {
  const Cmp = props.component;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props2: any = { ...props };
  delete props2.component;
  delete props2.value;
  delete props2.onChange;

  const [value, setValue] = useState<string>(String(props.value));
  const [origValue, setOrigValue] = useState<number>(props.value);

  useEffect(() => {
    setValue(String(props.value));
    setOrigValue(props.value);
  }, [props.value]);

  function applyValue(): boolean {
    let value2 = 0;
    if (value.length > 0) {
      value2 = parseFloat(value);
      if (!isFinite(value2)) {
        return false;
      }
      if (String(value2) !== value) {
        return false;
      }
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
      type="number"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !props.disableCommitOnEnter) {
          e.preventDefault();
          e.stopPropagation();
          if (!applyValue()) {
            alert(trans('invalid value'));
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
          alert(trans('invalid value'));
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
