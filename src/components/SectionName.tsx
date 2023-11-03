import { CSSProperties } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { blueGrey } from '@mui/material/colors';

const styleFill: CSSProperties = {
  flex: '1',
};

interface Props {
  text: string;
  secondaryText?: string;
  endElement?: React.ReactNode;
}

export default function SectionName(props: Props) {
  return (
    <Paper
      elevation={2}
      sx={{
        backgroundColor: blueGrey[50],
        padding: 1,
        display: 'flex',
      }}
    >
      <Typography style={styleFill} fontWeight="bold">
        {props.text}
        {props.secondaryText && (
          <Typography
            component="span"
            color="GrayText"
            sx={{ marginLeft: 0.5 }}
          >
            <small>{props.secondaryText}</small>
          </Typography>
        )}
      </Typography>
      {props.endElement && <div>{props.endElement}</div>}
    </Paper>
  );
}
