/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import useStateDelayed from '../useStateDelayed';
import Slider from '@mui/material/Slider';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';

interface Props {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  id?: string;
  label?: string;
}

export default function PropertySlider(props: Props) {
  const [value, setValue] = useStateDelayed<number>(
    props.value,
    props.onChange,
  );

  return (
    <>
      {props.label && (
        <InputLabel htmlFor={props.id}>
          {props.label}
          <Typography
            component="span"
            color="GrayText"
            sx={{ marginLeft: 0.5 }}
          >
            <small>{value}px</small>
          </Typography>
        </InputLabel>
      )}
      <Slider
        min={props.min}
        max={props.max}
        value={value}
        onChange={(e, newVal) => setValue(newVal as number, 300)}
        id={props.id}
      />
    </>
  );
}
