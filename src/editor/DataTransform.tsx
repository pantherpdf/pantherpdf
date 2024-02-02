/**
 * @file Manage data transformations. Add, delete, edit `Transform`s.
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { CSSProperties, useState } from 'react';
import type { Report } from '../types';
import type { GeneralProps } from './types';
import trans, { transName } from '../translation';
import { getTransform } from '../transforms/allTransforms';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faEdit,
  faPlus,
  faTimes,
  faTrash,
  faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import ObjectExplorer from './ObjectExplorer';
import InputApplyOnEnter from '../components/InputApplyOnEnter';
import SimpleDialog from '../components/SimpleDialog';
import SectionName from '../components/SectionName';
import { SourceData } from '../data/fetchSourceData';
import useTransformedData from './useTransformedData';
import type { TransformItem } from '../transforms/types';
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
            {transName(comp.name)}
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
                    <ListItemText>{trans('edit')}</ListItemText>
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
                    <ListItemText>{trans('up')}</ListItemText>
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
                    <ListItemText>{trans('down')}</ListItemText>
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
                    <ListItemText>{trans('delete')}</ListItemText>
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

async function readJsonFileFromFileSystem(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const el = document.createElement('INPUT') as HTMLInputElement;
    el.type = 'file';
    el.accept = 'application/json';
    el.multiple = false;
    el.addEventListener('change', function () {
      if (!el.files || el.files.length === 0) {
        return resolve('');
      }
      const f = el.files[0];
      const reader = new FileReader();
      reader.onload = e2 => {
        const txt =
          typeof e2.target?.result === 'string' ? e2.target.result : '';
        resolve(txt);
      };
      try {
        reader.readAsText(f);
      } catch (e) {
        return reject(e);
      }
    });
    el.click();
  });
}

interface TEdit {
  index: number;
  data: TransformItem;
}

export default function DataTransform(props: GeneralProps) {
  const [shownModalInsert, setShownModalInsert] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<TEdit | null>(null);
  const [showData, setShowData] = useState<number | null>(null);

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
      <Override {...props} showBrowseSourceData={() => setShowData(0)} />

      <SectionName text={trans('transform')} />
      {props.report.transforms.length > 0 && (
        <div>
          {props.report.transforms.map((item, idx) => (
            <TransformItemEditor
              {...props}
              item={item}
              index={idx}
              key={idx}
              showData={setShowData}
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
        {trans('transform')}
      </Button>

      {/* ADD NEW */}
      <SimpleDialog
        show={shownModalInsert}
        onHide={() => setShownModalInsert(false)}
        title={trans('insert data transform')}
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
                <ListItemText primary={transName(w.name)} />
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
              {trans('edit')} {transName(editCmp.name)}
            </DialogTitle>
            <IconButton
              aria-label={trans('close')}
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
              <editCmp.Editor
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
                label={trans('comment')}
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
                {trans('cancel')}
              </Button>
              <Button variant="contained" onClick={editSave}>
                {trans('save')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* DATA */}
      {showData !== null && (
        <DialogBrowseData
          {...props}
          applyNumTransforms={showData}
          onHide={() => setShowData(null)}
        />
      )}
    </>
  );
}

type DialogBrowseDataProps = {
  applyNumTransforms: number;
  onHide: () => void;
} & GeneralProps;
function DialogBrowseData(props: DialogBrowseDataProps) {
  const data = useTransformedData(props, props.applyNumTransforms);
  return (
    <SimpleDialog
      show={true}
      onHide={props.onHide}
      title={trans('data')}
      size="md"
    >
      <>
        {data.ok && <ObjectExplorer data={data.value} />}
        {!data.ok && <div>{data.errorMsg}</div>}
      </>
    </SimpleDialog>
  );
}

function Override(props: GeneralProps & { showBrowseSourceData: () => void }) {
  const [showUrl, setShowUrl] = useState(false);
  let dataUrl: string;
  let dataUrlEnabled: boolean;
  if (props.sourceDataOverride) {
    if (props.sourceDataOverride.type === 'url') {
      dataUrl = props.sourceDataOverride.url;
      dataUrlEnabled = true;
    } else {
      dataUrl = '';
      dataUrlEnabled = false;
    }
  } else {
    dataUrl = '';
    dataUrlEnabled = true;
  }
  const styleIrrelevant: CSSProperties = {
    color: '#999999',
    fontWeight: 'bold',
    textDecoration: 'line-through',
  };
  const styleSelected: CSSProperties = {
    fontWeight: 'bold',
    textDecoration: 'none',
  };
  return (
    <>
      <SectionName text={trans('source data')} />
      <p>
        {trans('source data')}
        :&nbsp;
        <strong
          style={props.sourceDataOverride ? styleIrrelevant : styleSelected}
        >
          {getSourceDescription(props.sourceData)}
        </strong>
        <br />
        {trans('override source data')}:&nbsp;
        <strong
          style={!props.sourceDataOverride ? styleIrrelevant : styleSelected}
        >
          {getSourceDescription(props.sourceDataOverride)}
        </strong>
        <br />
        <Link component="button" onClick={props.showBrowseSourceData}>
          {trans('preview')}
        </Link>
        {!props.sourceDataOverride && (
          <>
            <Link
              component="button"
              onClick={async () => {
                // select file and replace
                let text;
                try {
                  text = await readJsonFileFromFileSystem();
                } catch (err) {
                  alert(`Error: ${err}`);
                  return;
                }
                // empty when cancelled
                if (text) {
                  props.setSourceDataOverride({
                    type: 'json',
                    value: text,
                    description: trans('local json file'),
                  });
                }
              }}
              style={{ marginLeft: '1rem' }}
            >
              {trans('load json file')}
            </Link>
            <Link
              component="button"
              onClick={() => setShowUrl(!showUrl)}
              style={{ marginLeft: '1rem' }}
            >
              {trans('load url')}
            </Link>
          </>
        )}
        {!!props.sourceDataOverride && (
          <Link
            component="button"
            onClick={() => props.setSourceDataOverride(undefined)}
            style={{ marginLeft: '1rem' }}
          >
            {trans('clear override')}
          </Link>
        )}
      </p>
      {showUrl && (
        <InputApplyOnEnter
          component={TextField}
          value={dataUrl}
          onChange={val => {
            const str = String(val);
            const obj: SourceData | undefined =
              str.length > 0
                ? { type: 'url', url: str, description: '' }
                : undefined;
            props.setSourceDataOverride(obj);
          }}
          fullWidth
          id="source-url"
          placeholder="https://www.example.com/data.js(on)"
          disabled={!dataUrlEnabled}
        />
      )}
    </>
  );
}

function getSourceDescription(data: SourceData | undefined): string {
  if (!data) {
    return trans('empty');
  }
  if (data.description && data.description.length > 0) {
    return data.description;
  }
  if (data.type === 'url') {
    return data.url;
  }
  return data.type;
}
