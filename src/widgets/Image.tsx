/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { useState, CSSProperties } from 'react';
import type { WidgetItem, WidgetCompiled, Widget } from './types';
import { faEllipsisH, faImage } from '@fortawesome/free-solid-svg-icons';
import WidgetEditorName from './WidgetEditorName';
import InputApplyOnEnter, {
  WidthOptions,
  WidthRegex,
  inputFAdornment,
} from '../components/InputApplyOnEnter';
import PropertyAlign, { TAlign } from './PropertyAlign';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FileDialog from '../FileDialog';
import trans from '../translation';
import base64ArrayBuffer from './base64ArrayBuffer';
import SimpleDialog from '../components/SimpleDialog';
import SectionName from '../components/SectionName';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

export interface ImageData extends WidgetItem {
  type: 'Image';
  url: string;
  formula: string;
  align?: TAlign;
  width?: string;
  height?: string;
  fit?: 'fill' | 'contain' | 'cover';
}

export interface ImageCompiled extends WidgetCompiled {
  type: 'Image';
  data: string;
  align?: TAlign;
  width?: string;
  height?: string;
  fit?: 'fill' | 'contain' | 'cover';
}

// to force reload images when user reuploads or deletes image
// this will append &state=<number> to url to force reload
let imgState = 0;

export const apiPrefix = 'api://';

export const Image: Widget = {
  id: 'Image',
  name: { en: 'Image', sl: 'Slika' },
  icon: faImage,

  newItem: async (): Promise<ImageData> => {
    return {
      type: 'Image',
      children: [],
      url: '',
      formula: '',
      width: '',
    };
  },

  compile: async (item, helpers): Promise<ImageCompiled> => {
    const dt = item as ImageData;
    let data;
    if (dt.url.length > 0) {
      data = dt.url;
      if (data.startsWith(apiPrefix)) {
        if (!helpers.api.filesDownload) {
          throw new Error('Missing api.filesDownload');
        }
        const obj = await helpers.api.filesDownload(
          data.substring(apiPrefix.length),
        );
        if (obj.mimeType.indexOf(';') !== -1) {
          throw new Error('Bad mime type');
        }
        data = `data:${obj.mimeType};base64,${base64ArrayBuffer(obj.data)}`;
      }
    }
    //
    else if (dt.formula.length > 0) {
      const data2 = await helpers.evalFormula(dt.formula);
      if (typeof data2 !== 'string') {
        throw new Error(
          `Image from formula expected string but got ${typeof data2}`,
        );
      }
      data = data2;
    }
    //
    else {
      data = '';
    }
    return {
      type: dt.type,
      data,
      align: dt.align,
      width: dt.width,
      height: dt.height,
      fit: dt.fit,
    };
  },

  Editor: function (props) {
    const item = props.item as ImageData;

    const cssImg: CSSProperties = {
      display: 'inline-block',
    };
    if (item.width) {
      cssImg.width = item.width;
    } else {
      cssImg.maxWidth = '100%';
    }

    if (item.height) {
      cssImg.height = item.height;
    }
    if (item.width && item.height) {
      cssImg.objectFit = item.fit || 'fill';
    }

    let img;
    if (item.url.length > 0) {
      let url = item.url;
      if (url.startsWith(apiPrefix)) {
        url = props.api.filesDownloadUrl
          ? props.api.filesDownloadUrl(url.substring(apiPrefix.length))
          : '';
        // force refresh
        const hasQuestion = url.indexOf('?') !== -1;
        url += (hasQuestion ? '&' : '?') + '_reports_state=' + String(imgState);
      }
      img = <img src={url} alt="" style={cssImg} />;
    }
    //
    else if (item.formula.length > 0) {
      cssImg.backgroundColor = '#ddd';
      cssImg.textAlign = 'center';
      cssImg.minWidth = '100px';
      cssImg.padding = '20px 0';
      cssImg.overflow = 'hidden';
      img = (
        <div style={cssImg}>
          <Typography
            component="span"
            fontFamily="monospace"
            noWrap
            style={{ fontSize: '70%', opacity: '0.3' }}
          >
            {item.formula}
          </Typography>
        </div>
      );
    }
    //
    else {
      img = (
        <Typography color="GrayText">
          <small>{trans('no image selected')}</small>
        </Typography>
      );
    }

    const cssContainer: CSSProperties = {};
    if (item.align) {
      cssContainer.textAlign = item.align;
    }

    return (
      <WidgetEditorName {...props} name={Image.name}>
        <div style={cssContainer}>{img}</div>
      </WidgetEditorName>
    );
  },

  Preview: function (props) {
    const item = props.item as ImageCompiled;
    const cssImg: CSSProperties = {
      display: 'inline-block',
    };
    if (item.width) {
      cssImg.width = item.width;
    } else {
      cssImg.maxWidth = '100%';
    }
    if (item.height) {
      cssImg.height = item.height;
    }
    if (item.width && item.height) {
      cssImg.objectFit = item.fit || 'fill';
    }
    const cssContainer: CSSProperties = {};
    if (item.align) {
      cssContainer.textAlign = item.align;
    }

    let img;
    if (item.data === '') {
      return null;
    }
    //
    else if (item.data.trimStart().startsWith('<svg')) {
      img = (
        <div style={cssImg} dangerouslySetInnerHTML={{ __html: item.data }} />
      );
    }
    //
    else if (
      item.data.startsWith('data:image/') ||
      item.data.startsWith('http://') ||
      item.data.startsWith('https://') ||
      item.data.startsWith('/') ||
      item.data.startsWith('./') ||
      item.data.startsWith('../')
    ) {
      img = <img src={item.data} alt="" style={cssImg} />;
    }
    //
    else {
      console.log(item.data);
      throw new Error('Bad image data');
    }

    return <div style={cssContainer}>{img}</div>;
  },

  Properties: function (props) {
    const item = props.item as ImageData;
    const [showModal, setShowModal] = useState<boolean>(false);
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          value={item.formula}
          onChange={val => props.setItem({ ...item, formula: val })}
          label={trans('formula')}
          id="img-formula"
          InputProps={inputFAdornment}
        />

        <InputApplyOnEnter
          component={TextField}
          value={item.url}
          onChange={val => props.setItem({ ...item, url: val })}
          label={trans('url')}
          id="img-url"
          placeholder="https://www.example.com/image.jpg"
        />
        {props.api.files && (
          <Button
            color="secondary"
            variant="outlined"
            onClick={() => setShowModal(true)}
          >
            <FontAwesomeIcon icon={faEllipsisH} />
          </Button>
        )}

        <SectionName text={trans('size')} />

        <InputApplyOnEnter
          component={TextField}
          value={item.width || ''}
          onChange={val => {
            const val2: ImageData = { ...item };
            if (val) {
              val2.width = String(val);
            } else {
              delete val2.width;
            }
            return props.setItem(val2);
          }}
          regex={WidthRegex}
          label={trans('width')}
          id="img-width"
          helperText={WidthOptions}
        />

        <InputApplyOnEnter
          component={TextField}
          value={item.height || ''}
          onChange={val => {
            const val2: ImageData = { ...item };
            if (val) {
              val2.height = String(val);
            } else {
              delete val2.height;
            }
            return props.setItem(val2);
          }}
          regex={WidthRegex}
          label={trans('height')}
          id="img-height"
          helperText={WidthOptions}
        />

        <TextField
          select
          label={trans('img-fit')}
          value={
            !!item.fit && !!item.width && !!item.height ? item.fit : 'fill'
          }
          onChange={val => {
            const val2: ImageData = { ...item };
            if (val) {
              val2.fit = val.target.value as ImageData['fit'];
            } else {
              delete val2.fit;
            }
            return props.setItem(val2);
          }}
          id="Image-fit"
          disabled={!item.width || !item.height}
        >
          <MenuItem value="fill">{trans('img-fit-fill')}</MenuItem>
          <MenuItem value="contain">{trans('img-fit-contain')}</MenuItem>
          <MenuItem value="cover">{trans('img-fit-cover')}</MenuItem>
        </TextField>

        <SectionName text={trans('align')} />
        <PropertyAlign
          value={item.align}
          onChange={val => props.setItem({ ...item, align: val })}
        />
        <SimpleDialog
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          title={trans('select image')}
        >
          <FileDialog
            mode="value"
            value={
              item.url && item.url.startsWith(apiPrefix)
                ? item.url.substring(apiPrefix.length)
                : ''
            }
            onChange={val => {
              setShowModal(false);
              props.setItem({
                ...item,
                url: val && val.length > 0 ? `${apiPrefix}${val}` : '',
              });
            }}
            api={props.api}
            somethingChanged={() => (imgState += 1)}
          />
        </SimpleDialog>
      </>
    );
  },
};
