/**
 * DataTransform.tsx
 * Manage data transformations. Add, delete, edit Transform.
 */

import React, { useState } from 'react';
import { Report, TransformItem } from '../types';
import { GeneralProps, Transform } from './types';
import { Dropdown, Button, ButtonGroup, Modal } from 'react-bootstrap';
import Trans, { TransName } from '../translation';
import { getTransform } from '../transforms/allTransforms';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faEdit,
  faFolderOpen,
  faPlus,
  faTimes,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import ObjectExplorer from './ObjectExplorer';
import InputApplyOnEnter from '../widgets/InputApplyOnEnter';
import globalStyle from '../globalStyle.module.css';

/**
 * Function for calling all transformations
 * @func
 * @param {inputData} unknown - Input data
 * @param {len} number - Number of transformations to apply
 */
export async function transformData(
  allTrans: Transform[],
  inputData: unknown,
  transformData: TransformItem[],
  len?: number,
) {
  if (len === undefined) {
    len = transformData.length;
  }
  for (let i = 0; i < len; ++i) {
    const w = transformData[i];
    const comp = getTransform(allTrans, w.type);
    inputData = await comp.transform(inputData, w);
  }
  return inputData;
}

interface TransformItemProps extends GeneralProps {
  item: TransformItem;
  index: number;
  showData: (len: number) => void;
  up: (idx: number) => void;
  down: (idx: number) => void;
  itemDelete: (idx: number) => void;
  openEditor: (idx: number) => void;
}
function TransformItemEditor(props: TransformItemProps) {
  const comp = getTransform(props.transforms, props.item.type);
  return (
    <Dropdown as={ButtonGroup} className="d-flex" size="sm">
      <button
        className="btn btn-sm btn-outline-secondary flex-fill text-left"
        onClick={() => props.showData(props.index + 1)}
      >
        <span className="d-block">{TransName(comp.name)}</span>
        <small
          className="d-block text-truncate text-nowrap text-muted"
          style={{ maxWidth: '10rem' }}
        >
          {props.item.comment}
        </small>
      </button>
      <Dropdown.Toggle
        style={{ maxWidth: '3rem' }}
        split
        variant="outline-secondary"
        id="dropdown-custom-2"
      />
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => props.openEditor(props.index)}>
          <FontAwesomeIcon icon={faEdit} className="me-2" fixedWidth />
          {Trans('edit')}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={e => {
            e.preventDefault();
            props.up(props.index);
          }}
          disabled={props.index === 0}
        >
          <FontAwesomeIcon icon={faArrowUp} className="me-2" fixedWidth />
          {Trans('up')}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={e => {
            e.preventDefault();
            props.down(props.index);
          }}
          disabled={props.index + 1 === props.report.transforms.length}
        >
          <FontAwesomeIcon icon={faArrowDown} className="me-2" fixedWidth />
          {Trans('down')}
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item
          onClick={e => {
            e.preventDefault();
            props.itemDelete(props.index);
          }}
        >
          <FontAwesomeIcon icon={faTrash} className="me-2" fixedWidth />
          {Trans('delete')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

async function uploadOverrideSourceData(): Promise<unknown> {
  return new Promise(resolve => {
    let el = document.createElement('INPUT') as HTMLInputElement;
    el.type = 'file';
    el.accept = 'application/json';
    el.multiple = false;
    el.addEventListener('change', function (ev2) {
      const f = el.files && el.files.length > 0 ? el.files[0] : undefined;
      if (!f) {
        return resolve(undefined);
      }
      try {
        const reader = new FileReader();
        reader.onload = e2 => {
          if (!e2.target || typeof e2.target.result !== 'string') {
            return;
          }
          const dt = JSON.parse(e2.target.result);
          resolve(dt);
        };
        reader.readAsText(f);
      } catch (e) {
        alert(`Error: ${String(e)}`);
        return resolve(undefined);
      }
    });
    el.click();
  });
}

interface TEdit {
  index: number;
  data: TransformItem;
}

interface SourceDataShow {
  length?: number;
  data: unknown;
  errorMsg?: string;
}

export default function DataTransform(props: GeneralProps) {
  const [shownModalInsert, setShownModalInsert] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<TEdit | null>(null);
  const [showData, setShowData] = useState<SourceDataShow | null>(null);

  async function doShowData(len: number) {
    let dt;
    try {
      dt = await props.getSourceData();
    } catch (e) {
      let msg = String(e);
      if (msg.trim().length === 0) {
        msg = 'unknown error';
      }
      setShowData({ data: null, errorMsg: msg });
      return;
    }

    let dt2;
    try {
      dt2 = await transformData(
        props.transforms,
        dt,
        props.report.transforms,
        len,
      );
    } catch (e) {
      let msg = String(e);
      if (msg.trim().length === 0) {
        msg = 'unknown error';
      }
      setShowData({ data: null, errorMsg: msg });
      return;
    }
    setShowData({ data: dt2, length: len });
  }

  async function itemAdd(key: string) {
    const cmp = getTransform(props.transforms, key);
    const dt = await cmp.newItem();
    const report2: Report = {
      ...props.report,
      transforms: [...props.report.transforms, dt],
    };
    await props.setReport(report2);
    setShownModalInsert(false);
    setShowEdit({
      index: report2.transforms.length - 1,
      data: JSON.parse(JSON.stringify(dt)),
    });
  }

  async function itemUp(idx: number) {
    const report2: Report = {
      ...props.report,
      transforms: [...props.report.transforms],
    };
    const tmp = report2.transforms[idx - 1];
    report2.transforms[idx - 1] = report2.transforms[idx];
    report2.transforms[idx] = tmp;
    return props.setReport(report2);
  }

  async function itemDown(idx: number) {
    const report2: Report = {
      ...props.report,
      transforms: [...props.report.transforms],
    };
    const tmp = report2.transforms[idx + 1];
    report2.transforms[idx + 1] = report2.transforms[idx];
    report2.transforms[idx] = tmp;
    return props.setReport(report2);
  }

  async function itemDelete(idx: number) {
    const report2: Report = {
      ...props.report,
      transforms: [...props.report.transforms],
    };
    report2.transforms.splice(idx, 1);
    return props.setReport(report2);
  }

  function itemOpenEditor(idx: number) {
    setShowEdit({
      index: idx,
      data: JSON.parse(JSON.stringify(props.report.transforms[idx])),
    });
  }

  async function editSave() {
    if (!showEdit) {
      return;
    }
    const report2: Report = {
      ...props.report,
      transforms: [...props.report.transforms],
    };
    report2.transforms[showEdit.index] = showEdit.data;
    await props.setReport(report2);
    setShowEdit(null);
  }

  function editChange(data: TransformItem) {
    if (showEdit) {
      setShowEdit({ ...showEdit, data });
    }
  }

  const editCmp = showEdit
    ? getTransform(props.transforms, showEdit.data.type)
    : null;

  return (
    <>
      <div className={`${globalStyle.section} d-flex`}>
        <label htmlFor="source-url" className="flex-fill">
          {Trans('source data')}
        </label>
        {!!props.setSourceDataOverride && (
          <button
            className="btn btn-link py-0"
            style={{ color: '#666' }}
            onClick={async () => {
              if (!props.setSourceDataOverride) {
                return;
              }
              if (props.isSourceDataOverriden) {
                // remove
                props.setSourceDataOverride(undefined);
              } else {
                // select file and replace
                const dt = await uploadOverrideSourceData();
                if (dt) {
                  props.setSourceDataOverride(dt);
                }
              }
            }}
            title={Trans('load local json file')}
          >
            <FontAwesomeIcon
              icon={props.isSourceDataOverriden ? faTimes : faFolderOpen}
            />
          </button>
        )}
      </div>
      <InputApplyOnEnter
        id="source-url"
        value={props.report.dataUrl}
        onChange={val => {
          const report2: Report = { ...props.report, dataUrl: String(val) };
          props.setReport(report2);
        }}
        placeholder="https://www.example.com/data.js(on)"
      />

      <div className={globalStyle.section}>{Trans('transform')}</div>
      {props.report.transforms.map((item, idx) => (
        <TransformItemEditor
          {...props}
          item={item}
          index={idx}
          key={idx}
          showData={doShowData}
          up={itemUp}
          down={itemDown}
          itemDelete={itemDelete}
          openEditor={itemOpenEditor}
        />
      ))}
      <div className="">
        <button
          className="btn btn-sm btn-outline-secondary mt-2"
          onClick={() => setShownModalInsert(true)}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          {Trans('transform')}
        </button>
      </div>

      {/* ADD NEW */}
      <Modal show={shownModalInsert} onHide={() => setShownModalInsert(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{Trans('insert data transform')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="list-group">
            {props.transforms.map(w => {
              return (
                <button
                  className="btn list-group-item list-group-item-action"
                  key={w.id}
                  onClick={() => itemAdd(w.id)}
                >
                  {TransName(w.name)}
                </button>
              );
            })}
          </div>
        </Modal.Body>
      </Modal>

      {/* EDIT */}
      <Modal show={!!showEdit} onHide={() => setShowEdit(null)}>
        {editCmp && showEdit && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                {Trans('edit')} {TransName(editCmp.name)}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <editCmp.RenderEditor
                {...props}
                index={showEdit.index}
                item={showEdit.data}
                setItem={editChange}
              />
            </Modal.Body>
            <Modal.Footer>
              <input
                type="text"
                className="form-control flex-fill w-auto"
                id="trans-edit-comment"
                value={showEdit.data.comment}
                placeholder={Trans('comment')}
                onChange={e =>
                  editChange({
                    ...showEdit.data,
                    comment: e.currentTarget.value,
                  })
                }
              />
              <Button variant="secondary" onClick={() => setShowEdit(null)}>
                {Trans('cancel')}
              </Button>
              <Button variant="secondary" onClick={editSave}>
                {Trans('save')}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* DATA */}
      <Modal show={!!showData} onHide={() => setShowData(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{Trans('data')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            {showData?.data && <ObjectExplorer data={showData.data} />}
            {showData?.errorMsg && <div>{showData?.errorMsg}</div>}
          </>
        </Modal.Body>
      </Modal>
    </>
  );
}
