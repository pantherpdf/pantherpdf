import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import Trans from '../translation';
import { TReport } from '../types';
import InputApplyOnEnter from '../widgets/InputApplyOnEnter';
import { GeneralProps } from './types';
import globalStyle from '../globalStyle.module.css';

const reservedVars = ['data', 'report'];

export default function VarEditor(props: GeneralProps) {
  async function changeVar(
    idx: number | undefined,
    name: string | undefined,
    formula: string | undefined,
  ): Promise<void> {
    const report: TReport = { ...props.report };
    report.variables = [...report.variables];
    if (idx !== undefined) {
      if (name || formula) {
        name = name || report.variables[idx].name;
        if (reservedVars.indexOf(name) !== -1) {
          alert(Trans('var is reserved'));
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
        alert(Trans('var is reserved'));
        name += '_';
      }
      report.variables.push({ name, formula });
    }
    return props.setReport(report);
  }

  return (
    <div className="mt-3">
      <div className={globalStyle.section}>{Trans('variables')}</div>
      <table className="table table-sm">
        <thead>
          <tr>
            <th>{Trans('name')}</th>
            <th style={{ width: '50%' }}>{Trans('var value')}</th>
            <th style={{ width: '2rem' }}>{/* Delete */}</th>
          </tr>
        </thead>
        <tbody>
          {props.report.variables.map((v, idx) => (
            <tr key={v.name + idx}>
              <td>
                <InputApplyOnEnter
                  value={v.name}
                  onChange={val => changeVar(idx, String(val), undefined)}
                />
              </td>
              <td>
                <InputApplyOnEnter
                  value={v.formula}
                  onChange={val => changeVar(idx, undefined, String(val))}
                  placeholder="ƒ"
                />
              </td>
              <td>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => changeVar(idx, undefined, undefined)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
          {reservedVars.map(varName => (
            <tr key={varName}>
              <td>{varName}</td>
              <td></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="btn btn-outline-secondary"
        onClick={() => changeVar(undefined, 'var', '0')}
      >
        <FontAwesomeIcon icon={faPlus} className="me-2" />
        {Trans('add var')}
      </button>
    </div>
  );
}
