/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023-2024
 * @license MIT
 */

import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const Secondary = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  display: 'inline',
}));

export default Secondary;
