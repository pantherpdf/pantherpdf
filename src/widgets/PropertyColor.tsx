/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { CSSProperties, useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import InputApplyOnEnter from './InputApplyOnEnter';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';

const stylePopover: CSSProperties = {
  position: 'absolute',
  zIndex: '100',
};

const styleCover: CSSProperties = {
  position: 'fixed',
  top: '0',
  right: '0',
  bottom: '0',
  left: '0',
};

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function PropertyColor(props: Props) {
  const [show, setShow] = useState<boolean>(false);
  const [value, setValue] = useState<string>(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  // must use global listener
  // div.onMouseUp() is not called when user releases mouse outside of color selector
  useEffect(() => {
    window.document.documentElement.addEventListener('mouseup', mouseup);
    return () => {
      window.document.documentElement.removeEventListener('mouseup', mouseup);
    };
  });
  const mouseup = () => {
    if (value.toUpperCase() !== props.value) {
      props.onChange(value.toUpperCase());
    }
  };

  // calc if color is light or dark
  const r = parseInt(value.substring(1, 3), 16) / 255;
  const g = parseInt(value.substring(3, 5), 16) / 255;
  const b = parseInt(value.substring(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const isColorDark = lum < 0.5;

  return (
    <>
      <Paper sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          style={{ backgroundColor: value }}
          onClick={() => setShow(!show)}
        >
          <FontAwesomeIcon
            icon={faEllipsisH}
            style={{ color: isColorDark ? 'white' : 'black' }}
          />
        </IconButton>
        <InputApplyOnEnter
          component={InputBase}
          value={props.value}
          onChange={val2 => {
            const val = String(val2).toUpperCase();
            setValue(val);
            props.onChange(val);
          }}
          regex={/^#[0-9a-fA-F]{6}$/}
          sx={{ ml: 1, flex: 1 }}
        />
      </Paper>
      {show && (
        <div style={stylePopover}>
          <div style={styleCover} onClick={() => setShow(false)} />
          <HexColorPicker color={value} onChange={setValue} />
        </div>
      )}
    </>
  );
}
