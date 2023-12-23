/**
 * @file Prepare 2D array - table for csv output
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import type { Transform, TransformItem } from './types';
import type { IHelpers } from '../formula/types';
import FormulaEvaluate from '../formula/formula';
import InputApplyOnEnter from '../widgets/InputApplyOnEnter';
import Trans from '../translation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTable, faTimes } from '@fortawesome/free-solid-svg-icons';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

interface CSVRow {
  source: string;
  cols: string[];
}
export interface CSVData extends TransformItem {
  type: 'CSV';
  rows: CSVRow[];
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  paddingLeft: '0.1rem',
  paddingRight: '0.1rem',
}));

const CSV: Transform = {
  id: 'CSV',
  name: 'CSV',
  icon: faTable,

  newItem: async () => {
    const obj: CSVData = {
      type: 'CSV',
      comment: '',
      rows: [
        {
          source: '',
          cols: ['', '', ''],
        },
      ],
    };
    return obj;
  },

  transform: async (dt, item2: TransformItem) => {
    const item = item2 as CSVData;
    const arr: string[][] = [];
    const helper: IHelpers & { vars: {} } = {
      vars: {
        data: dt,
      },
    };
    for (const rowDef of item.rows) {
      if (rowDef.source.length > 0) {
        // append zero or more rows, based on source
        const rowSource = await FormulaEvaluate(rowDef.source, helper);
        if (!Array.isArray(rowSource)) {
          throw new Error(
            `transform Filter: source of row should be array but got: ${typeof rowSource}, for source: ${
              rowDef.source
            }.`,
          );
        }
        for (const rowItem of rowSource) {
          const row: string[] = [];
          helper.vars.item = rowItem;
          for (const cellFormula of rowDef.cols) {
            const cell = await FormulaEvaluate(cellFormula, helper);
            row.push(String(cell));
          }
          delete helper.vars.item;
          arr.push(row);
        }
      }
      // append one row
      else {
        const row: string[] = [];
        for (const cellFormula of rowDef.cols) {
          const cell = await FormulaEvaluate(cellFormula, helper);
          row.push(String(cell));
        }
        arr.push(row);
      }
    }
    return arr;
  },

  RenderEditor: function (props) {
    const item = props.item as CSVData;
    return (
      <>
        <Table size="small">
          <TableBody>
            <TableRow>
              <StyledTableCell>{Trans('source data')}</StyledTableCell>
              {item.rows[0].cols.map((_, colIdx) => (
                <StyledTableCell key={colIdx}>
                  <Stack>
                    <div style={{ flex: '1' }}>{columnName(colIdx + 1)}</div>
                    <Button
                      size="small"
                      color="secondary"
                      variant="outlined"
                      onClick={() => removeCol(item, props.setItem, colIdx)}
                      title={Trans('remove')}
                      disabled={item.rows[0].cols.length <= 1}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                  </Stack>
                </StyledTableCell>
              ))}
              <StyledTableCell></StyledTableCell>
            </TableRow>
            {item.rows.map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                <StyledTableCell>
                  <InputApplyOnEnter
                    component={TextField}
                    value={row.source}
                    onChange={val =>
                      updateSource(item, props.setItem, rowIdx, String(val))
                    }
                    placeholder="ƒ"
                    size="small"
                  />
                </StyledTableCell>
                {row.cols.map((col, colIdx) => (
                  <StyledTableCell key={colIdx}>
                    <InputApplyOnEnter
                      component={TextField}
                      value={col}
                      onChange={val =>
                        updateCell(
                          item,
                          props.setItem,
                          rowIdx,
                          colIdx,
                          String(val),
                        )
                      }
                      placeholder="ƒ"
                      size="small"
                    />
                  </StyledTableCell>
                ))}
                <StyledTableCell>
                  <Button
                    size="small"
                    color="secondary"
                    variant="outlined"
                    onClick={() => removeRow(item, props.setItem, rowIdx)}
                    title={Trans('remove')}
                    disabled={item.rows.length <= 1}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography color="GrayText">
          <small>{Trans('current item is in var -name-', ['item'])}</small>
        </Typography>

        <ButtonGroup color="secondary" variant="outlined">
          <Button
            onClick={() => addRow(item, props.setItem)}
            startIcon={<FontAwesomeIcon icon={faPlus} />}
          >
            {Trans('add row')}
          </Button>
          <Button
            onClick={() => addCol(item, props.setItem)}
            startIcon={<FontAwesomeIcon icon={faPlus} />}
          >
            {Trans('add col')}
          </Button>
        </ButtonGroup>
      </>
    );
  },
};

function removeCol(
  item: CSVData,
  setItem: (itm: CSVData) => void,
  colIdx: number,
): void {
  if (item.rows.length === 0) {
    return;
  }
  if (item.rows[0].cols.length <= 1) {
    return;
  }
  const item2: CSVData = { ...item };
  item2.rows = item2.rows.map(x => ({ ...x }));
  for (const row of item2.rows) {
    row.cols = [...row.cols];
    row.cols.splice(colIdx, 1);
  }
  setItem(item2);
}

function addCol(item: CSVData, setItem: (itm: CSVData) => void): void {
  const item2: CSVData = { ...item };
  item2.rows = item2.rows.map(x => ({ ...x }));
  for (const row of item2.rows) {
    row.cols = [...row.cols, ''];
  }
  setItem(item2);
}

function removeRow(
  item: CSVData,
  setItem: (itm: CSVData) => void,
  rowIdx: number,
): void {
  if (item.rows.length <= 1) {
    return;
  }
  const item2: CSVData = { ...item };
  item2.rows = [...item2.rows];
  item2.rows.splice(rowIdx, 1);
  setItem(item2);
}

function addRow(item: CSVData, setItem: (itm: CSVData) => void): void {
  const item2: CSVData = { ...item };
  const row: CSVRow = {
    source: '',
    cols: item2.rows[0].cols.map(_ => ''),
  };
  item2.rows = [...item2.rows, row];
  setItem(item2);
}

function updateCell(
  item: CSVData,
  setItem: (itm: CSVData) => void,
  rowIdx: number,
  colIdx: number,
  val: string,
): void {
  const item2: CSVData = { ...item };
  item2.rows = [...item2.rows];
  item2.rows[rowIdx] = { ...item2.rows[rowIdx] };
  item2.rows[rowIdx].cols = [...item2.rows[rowIdx].cols];
  item2.rows[rowIdx].cols[colIdx] = val;
  setItem(item2);
}

function updateSource(
  item: CSVData,
  setItem: (itm: CSVData) => void,
  rowIdx: number,
  val: string,
): void {
  const item2: CSVData = { ...item };
  item2.rows = [...item2.rows];
  item2.rows[rowIdx] = { ...item2.rows[rowIdx] };
  item2.rows[rowIdx].source = val;
  setItem(item2);
}

function columnName(num: number): string {
  let ret, a, b;
  for (ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
    ret = String.fromCharCode(Math.floor((num % b) / a) + 65) + ret;
  }
  return ret;
}

export { CSV };
