/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React from 'react';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import trans from '../translation';
import type { Report } from '../types';
import InputApplyOnEnter from '../components/InputApplyOnEnter';
import type { GeneralProps } from './types';
import SectionName from '../components/SectionName';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

const reservedVars = ['data', 'report'];

const StyledTableCell = styled(TableCell)(() => ({
  paddingLeft: '0.1rem',
  paddingRight: '0.1rem',
}));

export default function VarEditor(props: GeneralProps) {
  async function changeVar(
    idx: number | undefined,
    name: string | undefined,
    formula: string | undefined,
  ): Promise<void> {
    const report: Report = { ...props.report };
    report.variables = [...report.variables];
    if (idx !== undefined) {
      if (name || formula) {
        name = name || report.variables[idx].name;
        if (reservedVars.indexOf(name) !== -1) {
          alert(trans('var is reserved'));
          name += '_';
        }
        report.variables[idx] = { ...report.variables[idx] };
        report.variables[idx].name = name;
        report.variables[idx].formula =
          formula || report.variables[idx].formula;
      } else {
        report.variables.splice(idx, 1);
      }
    } else {
      if (!name || !formula) {
        throw new Error('missing name and/or value');
      }
      if (reservedVars.indexOf(name) !== -1) {
        alert(trans('var is reserved'));
        name += '_';
      }
      report.variables.push({ name, formula });
    }
    return props.setReport(report);
  }

  return (
    <>
      <SectionName text={trans('variables')} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell>{trans('name')}</StyledTableCell>
            <StyledTableCell sx={{ width: '50%' }}>
              {trans('var value')} <i>ƒ</i>
            </StyledTableCell>
            <StyledTableCell sx={{ width: '1.5rem' }}>
              {/* Delete */}
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.report.variables.map((v, idx) => (
            <TableRow key={v.name + idx}>
              <StyledTableCell>
                <InputApplyOnEnter
                  component={TextField}
                  value={v.name}
                  onChange={val => changeVar(idx, String(val), undefined)}
                  size="small"
                  hiddenLabel
                  fullWidth
                  variant="filled"
                />
              </StyledTableCell>
              <StyledTableCell>
                <InputApplyOnEnter
                  component={TextField}
                  value={v.formula}
                  onChange={val => changeVar(idx, undefined, String(val))}
                  size="small"
                  hiddenLabel
                  fullWidth
                  variant="filled"
                />
              </StyledTableCell>
              <StyledTableCell>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => changeVar(idx, undefined, undefined)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </StyledTableCell>
            </TableRow>
          ))}
          {reservedVars.map(varName => (
            <TableRow key={varName}>
              <StyledTableCell>{varName}</StyledTableCell>
              <StyledTableCell></StyledTableCell>
              <StyledTableCell></StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        color="secondary"
        variant="outlined"
        onClick={() => changeVar(undefined, 'var', '0')}
        startIcon={<FontAwesomeIcon icon={faPlus} />}
      >
        {trans('add var')}
      </Button>
    </>
  );
}
