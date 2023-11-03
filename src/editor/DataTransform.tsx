/**
 * @file Manage data transformations. Add, delete, edit `Transform`s.
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React, { useState } from 'react';
import { Report, TransformItem } from '../types';
import { GeneralProps, Transform } from './types';
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
  faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import ObjectExplorer from './ObjectExplorer';
import InputApplyOnEnter from '../widgets/InputApplyOnEnter';
import SimpleDialog from '../components/SimpleDialog';
import SectionName from '../components/SectionName';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ButtonGroup from '@mui/material/ButtonGroup';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';

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
  const id = `TransformItemEditor-${props.item.type}-${props.index}`;
  const menuId = `${id}-menu`;

  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup variant="outlined" fullWidth ref={anchorRef}>
        <Button
          onClick={() => props.showData(props.index + 1)}
          sx={{ textTransform: 'none', display: 'block' }}
        >
          <Typography align="left">
            <FontAwesomeIcon
              icon={comp.icon}
              style={{ marginRight: '0.25rem' }}
            />
            {TransName(comp.name)}
          </Typography>
          {props.item.comment && (
            <Typography align="left" color="GrayText" noWrap>
              <small>{props.item.comment}</small>
            </Typography>
          )}
        </Button>

        <Button
          aria-controls={open ? menuId : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="menu"
          onClick={handleToggle}
          sx={{ flex: '0 0 0' }}
        >
          <FontAwesomeIcon icon={faCaretDown} fixedWidth />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        placement="top-end"
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  <MenuItem
                    onClick={() => {
                      setOpen(false);
                      props.openEditor(props.index);
                    }}
                  >
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faEdit} fixedWidth />
                    </ListItemIcon>
                    <ListItemText>{Trans('edit')}</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setOpen(false);
                      props.up(props.index);
                    }}
                    disabled={props.index === 0}
                  >
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faArrowUp} fixedWidth />
                    </ListItemIcon>
                    <ListItemText>{Trans('up')}</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setOpen(false);
                      props.down(props.index);
                    }}
                    disabled={
                      props.index + 1 === props.report.transforms.length
                    }
                  >
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faArrowDown} fixedWidth />
                    </ListItemIcon>
                    <ListItemText>{Trans('down')}</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      setOpen(false);
                      props.itemDelete(props.index);
                    }}
                  >
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faTrash} fixedWidth />
                    </ListItemIcon>
                    <ListItemText>{Trans('delete')}</ListItemText>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
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
      <SectionName
        text={Trans('source data')}
        endElement={
          !!props.setSourceDataOverride && (
            <Link
              component="button"
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
            </Link>
          )
        }
      />
      <InputApplyOnEnter
        component={TextField}
        value={props.report.dataUrl}
        onChange={val => {
          const report2: Report = { ...props.report, dataUrl: String(val) };
          props.setReport(report2);
        }}
        fullWidth
        id="source-url"
        placeholder="https://www.example.com/data.js(on)"
      />

      <SectionName text={Trans('transform')} />
      {props.report.transforms.length > 0 && (
        <div>
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
        </div>
      )}
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setShownModalInsert(true)}
        startIcon={<FontAwesomeIcon icon={faPlus} />}
      >
        {Trans('transform')}
      </Button>

      {/* ADD NEW */}
      <SimpleDialog
        show={shownModalInsert}
        onHide={() => setShownModalInsert(false)}
        title={Trans('insert data transform')}
      >
        <List sx={{ pt: 0, minWidth: '20rem' }}>
          {props.transforms.map(w => {
            return (
              <ListItemButton
                key={w.id}
                disableGutters
                onClick={() => itemAdd(w.id)}
              >
                <ListItemAvatar>
                  <Avatar>
                    <FontAwesomeIcon icon={w.icon} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={TransName(w.name)} />
              </ListItemButton>
            );
          })}
        </List>
      </SimpleDialog>

      {/* EDIT */}
      <Dialog open={!!showEdit} onClose={() => setShowEdit(null)} maxWidth="xl">
        {editCmp && showEdit && (
          <>
            <DialogTitle>
              {Trans('edit')} {TransName(editCmp.name)}
            </DialogTitle>
            <IconButton
              aria-label={Trans('close')}
              sx={{
                position: 'absolute',
                right: 13,
                top: 13,
              }}
              onClick={() => setShowEdit(null)}
            >
              <FontAwesomeIcon icon={faTimes} fixedWidth />
            </IconButton>
            <DialogContent dividers>
              <editCmp.RenderEditor
                {...props}
                index={showEdit.index}
                item={showEdit.data}
                setItem={editChange}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <TextField
                id="trans-edit-comment"
                size="small"
                fullWidth
                label={Trans('comment')}
                variant="outlined"
                value={showEdit.data.comment}
                onChange={e =>
                  editChange({
                    ...showEdit.data,
                    comment: e.target.value,
                  })
                }
              />
              <Button variant="outlined" onClick={() => setShowEdit(null)}>
                {Trans('cancel')}
              </Button>
              <Button variant="contained" onClick={editSave}>
                {Trans('save')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* DATA */}
      <SimpleDialog
        show={!!showData}
        onHide={() => setShowData(null)}
        title={Trans('data')}
        size="md"
      >
        <>
          {showData?.data && <ObjectExplorer data={showData.data} />}
          {showData?.errorMsg && <div>{showData?.errorMsg}</div>}
        </>
      </SimpleDialog>
    </>
  );
}
