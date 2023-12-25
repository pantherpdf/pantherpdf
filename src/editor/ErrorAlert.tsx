/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import trans from '../translation';

export default function ErrorAlert({ msg }: { msg: string }) {
  return (
    <Alert severity="error">
      <AlertTitle>{trans('error')}</AlertTitle>
      {msg}
    </Alert>
  );
}
