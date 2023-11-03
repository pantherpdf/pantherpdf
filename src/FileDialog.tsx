/**
 * @file Component to enable user to browse, select, upload files.
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { ApiFileMetaData, ApiUploadMetaData } from './types';
import type { ApiEndpoints } from './types';
import FileSelect from './FileSelect';
import Trans from './translation';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

// check browser support for fetch stream upload (upload progress bar)
// Chrome 92 requires experimental flag #enable-experimental-web-platform-features
interface RequestInit2 extends RequestInit {
  // https://fetch.spec.whatwg.org/#dom-requestinit-duplex
  duplex: any;
}
const supportsRequestStreams = (() => {
  // https://developer.chrome.com/articles/fetch-streaming-requests/#feature-detection
  if (
    typeof window === 'undefined' ||
    window.Request === undefined ||
    window.ReadableStream === undefined
  ) {
    return false;
  }
  let duplexAccessed = false;

  const init: RequestInit2 = {
    body: new window.ReadableStream(),
    method: 'POST',
    get duplex() {
      duplexAccessed = true;
      return 'half';
    },
  };
  const hasContentType = new window.Request('', init).headers.has(
    'Content-Type',
  );

  return duplexAccessed && !hasContentType;
})();

interface Props {
  mode: 'value' | 'link';
  value?: string | undefined;
  onChange?: (val: string | undefined) => void;
  api: ApiEndpoints;
  somethingChanged?: () => void;
}

type TStatus = 'waiting' | 'uploading' | 'complete';

interface Upload {
  status: TStatus;
  errorMsg?: string;
  progress?: number;
  file: File;
}

interface TFileUpload extends ApiFileMetaData {
  upload?: Upload;
}

export default function FileDialog(props: Props) {
  const [files, setFiles] = useState<TFileUpload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // shared upload code
  function prepareUpload(fileUpload: File[]) {
    // remove big files
    fileUpload = fileUpload.filter((f, idx) => {
      if (f.size > 15_000_000) {
        alert(Trans('file -name- too big', [f.name]));
        return false;
      }
      return true;
    });
    // remove duplicate names
    fileUpload = fileUpload.filter(
      (f, idx) => idx === fileUpload.findIndex(f2 => f2.name === f.name),
    );

    // empty?
    if (fileUpload.length === 0) {
      return;
    }

    // add to list
    const files2 = files.filter(f => {
      // name exists
      const newFile = fileUpload.find(f2 => f2.name === f.name);
      return !newFile;
    });
    // combine
    const fileUpload2: TFileUpload[] = fileUpload.map(f => {
      return {
        name: f.name,
        mimeType: f.type,
        uploadTime: new Date().toISOString().substring(0, 19) + 'Z',
        modifiedTime:
          new Date(f.lastModified).toISOString().substring(0, 19) + 'Z',
        size: f.size,
        upload: {
          status: 'waiting',
          file: f,
        },
      };
    });
    files2.splice(files2.length, 0, ...fileUpload2);
    setFiles(files2);

    // do not call doUpload() because files is not ready yet
    // it will get called by useEffect()
  }

  function reportStatus(
    name: string,
    status: TStatus,
    errorMsg?: string,
    progress?: number,
  ) {
    const idx = files.findIndex(f2 => f2.name === name);
    if (idx === -1) {
      return;
    }
    const oldUpload = files[idx].upload;
    if (!oldUpload) {
      throw new Error('missing property upload');
    }
    const files2 = [...files];
    const upload: Upload = { ...oldUpload, status };
    if (errorMsg) {
      upload.errorMsg = errorMsg;
    } else {
      delete upload.errorMsg;
    }
    if (progress) {
      upload.progress = progress;
    } else {
      delete upload.progress;
    }
    files2[idx] = {
      ...files2[idx],
      upload,
    };
    setFiles(files2);
    if (props.somethingChanged) {
      props.somethingChanged();
    }
  }

  async function doUpload(f: TFileUpload) {
    reportStatus(f.name, 'uploading');

    if (!f.upload || !props.api.filesUpload) {
      throw new Error('Missing upload');
    }

    try {
      const dt: ApiUploadMetaData = {
        name: f.name,
        modifiedTime: f.modifiedTime,
        mimeType: f.mimeType,
      };
      await props.api.filesUpload(f.upload.file, dt, prc => {
        reportStatus(f.name, 'uploading', undefined, prc);
      });
      reportStatus(f.name, 'complete');
    } catch (e) {
      let msg = String(e);
      if (msg.trim().length === 0) {
        msg = 'unknown error';
      }
      reportStatus(f.name, 'complete', msg);
    }
  }

  // check to start upload
  useEffect(() => {
    const f = files.find(
      f =>
        f.upload &&
        (f.upload.status === 'waiting' || f.upload.status === 'uploading'),
    );
    if (f && f.upload && f.upload.status === 'waiting') {
      doUpload(f);
    }
    // eslint-disable-next-line
	}, [files])

  // load files
  useEffect(() => {
    if (!props.api.files) {
      setLoading(false);
      return;
    }
    setLoading(true);
    props.api.files().then(resFiles => {
      setFiles(resFiles);
      setLoading(false);
    });
  }, [props.api]);

  async function fileDelete(name: string): Promise<void> {
    // find current file object
    const f = files.find(f => f.name === name);
    if (!f) {
      return;
    }
    // if upload failed, delete without questions
    if (!f.upload || !f.upload.errorMsg) {
      if (!props.api.filesDelete) {
        return;
      }
      if (!window.confirm(Trans('delete confirm', [name]))) {
        return;
      }
      await props.api.filesDelete(name);
    }
    const arr = files.filter(f => f.name !== name);
    setFiles(arr);

    if (props.somethingChanged) {
      props.somethingChanged();
    }
  }

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{Trans('name')}</TableCell>
            <TableCell style={{ width: '220px' }}>
              {Trans('uploaded')}
            </TableCell>
            <TableCell style={{ width: '220px' }}>
              {Trans('modified')}
            </TableCell>
            <TableCell style={{ width: '100px' }}>{Trans('size')}</TableCell>
            <TableCell style={{ width: '100px' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map(f => (
            <TableRow key={f.name}>
              <TableCell>
                {!f.upload ||
                (f.upload.status === 'complete' && !f.upload.errorMsg) ? (
                  props.mode === 'link' && props.api.filesDownloadUrl ? (
                    <Link
                      href={props.api.filesDownloadUrl(f.name)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'block' }}
                    >
                      {f.name}
                    </Link>
                  ) : (
                    <Link
                      sx={{
                        width: '100%',
                        display: 'block',
                        textAlign: 'left',
                      }}
                      component="button"
                      onClick={() => props.onChange && props.onChange(f.name)}
                    >
                      {f.name}
                    </Link>
                  )
                ) : (
                  <span>{f.name}</span>
                )}
                {f.upload && (
                  <>
                    {f.upload.status === 'waiting' && (
                      <div>{Trans('waiting')}</div>
                    )}
                    {f.upload.status === 'complete' && (
                      <>
                        {f.upload.errorMsg ? (
                          <Alert severity="error">{f.upload.errorMsg}</Alert>
                        ) : (
                          <Alert severity="success">
                            {Trans('upload complete')}
                          </Alert>
                        )}
                      </>
                    )}
                    {f.upload.status === 'uploading' && (
                      <>
                        <div>
                          {Trans('uploading...')}
                          <FontAwesomeIcon
                            icon={faSpinner}
                            spin
                            style={{ marginLeft: '0.5rem' }}
                          />
                        </div>
                        {supportsRequestStreams && (
                          <LinearProgress
                            variant="determinate"
                            value={(f.upload.progress || 0) * 100}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </TableCell>
              <TableCell>
                <small>{f.uploadTime}</small>
              </TableCell>
              <TableCell>
                <small>{f.modifiedTime}</small>
              </TableCell>
              <TableCell>{f.size}</TableCell>
              <TableCell>
                <Button
                  onClick={() => fileDelete(f.name)}
                  size="small"
                  variant="outlined"
                  startIcon={<FontAwesomeIcon icon={faTrash} fixedWidth />}
                >
                  {Trans('delete')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {files.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography align="center" color="GrayText" fontStyle="italic">
                  <small>{Trans('empty')}</small>
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {loading && (
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          style={{ marginLeft: '0.5rem' }}
        />
      )}

      {props.api.filesUpload && (
        <FileSelect onSelect={fls => prepareUpload(fls)} />
      )}
    </>
  );
}
