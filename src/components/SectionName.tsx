/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import React from 'react';
import { CSSProperties } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Secondary from './Secondary';

const styleFill: CSSProperties = {
  flex: '1',
};

const Bg = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.action.selected,
  display: 'flex',
  padding: '0.5rem 1rem',
}));

interface Props {
  text: string;
  secondaryText?: string;
  endElement?: React.ReactNode;
}

/** Title for a section in editor's properties */
export default function SectionName(props: Props): JSX.Element {
  return (
    <Bg elevation={2}>
      <Typography style={styleFill} fontWeight="bold">
        {props.text}
        {props.secondaryText && (
          <Secondary style={{ marginLeft: '0.5rem' }}>
            <small>{props.secondaryText}</small>
          </Secondary>
        )}
      </Typography>
      {props.endElement && <div>{props.endElement}</div>}
    </Bg>
  );
}
