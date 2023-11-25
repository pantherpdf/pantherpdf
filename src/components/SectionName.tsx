import { CSSProperties } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const styleFill: CSSProperties = {
  flex: '1',
};

const Bg = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.action.selected,
  display: 'flex',
  padding: '0.5rem 1rem',
}));

const Secondary = styled(Typography)(({ theme }) => ({
  marginLeft: 0.5,
  color: theme.palette.text.secondary,
  display: 'inline',
}));

interface Props {
  text: string;
  secondaryText?: string;
  endElement?: React.ReactNode;
}

export default function SectionName(props: Props) {
  return (
    <Bg elevation={2}>
      <Typography style={styleFill} fontWeight="bold">
        {props.text}
        {props.secondaryText && (
          <Secondary>
            <small>{props.secondaryText}</small>
          </Secondary>
        )}
      </Typography>
      {props.endElement && <div>{props.endElement}</div>}
    </Bg>
  );
}
