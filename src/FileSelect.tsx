/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React, { CSSProperties, useRef } from 'react';
import Trans from './translation';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const boxStyle: CSSProperties = {
  border: '3px dashed rgba(0,50,160,0.2)',
  margin: '1rem 0',
  padding: '1rem',
};

interface Props {
  onSelect: (files: File[]) => void;
}

export function extractFiles(dataTransfer: DataTransfer): File[] {
  const fileUpload: File[] = [];
  if (dataTransfer.items) {
    for (let i = 0; i < dataTransfer.items.length; i++) {
      if (dataTransfer.items[i].kind === 'file') {
        const file = dataTransfer.items[i].getAsFile();
        if (file) {
          fileUpload.push(file);
        }
      }
    }
  } else {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      fileUpload.push(file);
    }
  }
  return fileUpload;
}

export default function FileSelect(props: Props) {
  const selectFileElement = useRef<HTMLInputElement>(null);

  // drag-drop
  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    props.onSelect(extractFiles(e.dataTransfer));
  }

  function selectFileElementChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }
    const arr: File[] = [];
    for (let i = 0; i < e.target.files.length; ++i) {
      arr.push(e.target.files[i]);
    }
    e.target.value = '';
    props.onSelect(arr);
  }

  // click to browse files
  function selectFileClick() {
    if (!selectFileElement.current) {
      return;
    }
    selectFileElement.current.click();
  }

  return (
    <>
      <Stack
        direction="column"
        style={boxStyle}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <Typography align="center">{Trans('drop-files here')}</Typography>
        <Typography color="GrayText" align="center">
          {Trans('drop-or')}
        </Typography>
        <Typography align="center">
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={selectFileClick}
          >
            {Trans('drop-select files')}
          </Button>
        </Typography>
      </Stack>
      <input
        type="file"
        style={{ display: 'none' }}
        ref={selectFileElement}
        onChange={selectFileElementChange}
      />
    </>
  );
}
