import Trans from '../translation';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';

interface ModalProps {
  title: string | JSX.Element | JSX.Element[];
  show: boolean;
  onHide: () => void;
  children: JSX.Element | JSX.Element[];
  size?: DialogProps['maxWidth'];
  contentBackgroundColor?: string;
}

type IconButtonProps = React.ComponentProps<typeof IconButton>;
type SxProps = IconButtonProps['sx'];
const closeStyle: SxProps = {
  position: 'absolute',
  right: 13,
  top: 13,
};

export default function SimpleDialog(props: ModalProps) {
  return (
    <>
      <Dialog
        onClose={props.onHide}
        open={props.show}
        maxWidth={props.size ? props.size : 'lg'}
        fullWidth={!!props.size}
      >
        <DialogTitle>{props.title}</DialogTitle>
        <IconButton
          aria-label={Trans('close')}
          onClick={props.onHide}
          sx={closeStyle}
        >
          <FontAwesomeIcon icon={faTimes} fixedWidth />
        </IconButton>
        <DialogContent sx={{ backgroundColor: props.contentBackgroundColor }}>
          {props.children}
        </DialogContent>
      </Dialog>
    </>
  );
}
