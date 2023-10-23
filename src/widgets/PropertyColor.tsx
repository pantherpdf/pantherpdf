/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import InputApplyOnEnter from './InputApplyOnEnter';
import style from './PropertyColor.module.css';

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
      <div className="input-group mb-3">
        <button
          className="btn btn-outline-secondary"
          style={{ backgroundColor: value }}
          onClick={() => setShow(!show)}
        >
          <FontAwesomeIcon
            icon={faEllipsisH}
            style={{ color: isColorDark ? 'white' : 'black' }}
          />
        </button>
        <InputApplyOnEnter
          value={props.value}
          onChange={val2 => {
            const val = String(val2).toUpperCase();
            setValue(val);
            props.onChange(val);
          }}
          regex={/^#[0-9a-fA-F]{6}$/}
        />
      </div>
      {show && (
        <div className={style.popover}>
          <div className={style.cover} onClick={() => setShow(false)} />
          <HexColorPicker color={value} onChange={setValue} />
        </div>
      )}
    </>
  );
}
