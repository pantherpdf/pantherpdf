/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2023
 * @license MIT
 */

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Trans from '../translation';
import ErrorAlert from './ErrorAlert';
import type { GeneralProps } from './types';
import useTransformedData from './useTransformedData';

export default function RenderContentCsv(props: GeneralProps) {
  const data = useTransformedData(props);
  if (!data.ok) {
    return <ErrorAlert msg={data.errorMsg} />;
  }
  if (!Array.isArray(data.value)) {
    return <ErrorAlert msg={Trans('data must be 2D array')} />;
  }
  return (
    <Table>
      <TableBody>
        {data.value.map((row, idx) => (
          <TableRow key={idx}>
            {Array.isArray(row) &&
              row.map((cell, idx2) => (
                <TableCell key={idx2}>{String(cell)}</TableCell>
              ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
