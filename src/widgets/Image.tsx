/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React, { useState, CSSProperties } from 'react';
import { Item, ItemCompiled } from '../types';
import type { Widget } from '../editor/types';
import { faEllipsisH, faImage } from '@fortawesome/free-solid-svg-icons';
import BoxName from './BoxName';
import InputApplyOnEnter, {
  WidthOptions,
  WidthRegex,
  inputFAdornment,
} from './InputApplyOnEnter';
import PropertyAlign, { TAlign } from './PropertyAlign';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FileDialog from '../FileDialog';
import Trans from '../translation';
import base64ArrayBuffer from './base64ArrayBuffer';
import SimpleDialog from '../components/SimpleDialog';
import SectionName from '../components/SectionName';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

export interface ImageData extends Item {
  type: 'Image';
  url: string;
  formula: string;
  align?: TAlign;
  width?: string;
  height?: string;
  fit?: 'fill' | 'contain' | 'cover';
}

export interface ImageCompiled extends ItemCompiled {
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

  compile: async (dt: ImageData, helpers): Promise<ImageCompiled> => {
    let data;
    if (dt.url.length > 0) {
      data = dt.url;
      if (data.startsWith('local/')) {
        if (!helpers.api.filesDownload) {
          throw new Error('Missing api.filesDownload');
        }
        const obj = await helpers.api.filesDownload(data.substring(6));
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

  RenderEditor: function (props) {
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
      if (url.startsWith('local/')) {
        url = props.api.filesDownloadUrl
          ? props.api.filesDownloadUrl(url.substring(6))
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
          <small>{Trans('no image selected')}</small>
        </Typography>
      );
    }

    const cssContainer: CSSProperties = {};
    if (item.align) {
      cssContainer.textAlign = item.align;
    }

    return (
      <BoxName {...props} name={Image.name}>
        <div style={cssContainer}>{img}</div>
      </BoxName>
    );
  },

  RenderPreview: function (props) {
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
      return '';
    }
    //
    else if (item.data.trimStart().startsWith('<svg')) {
      img = `<div style="${props.styleToStringAttribute(cssImg)}">${
        item.data
      }</div>`;
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
      img = `<img src="${props.escapeHtml(
        item.data,
      )}" alt="" style="${props.styleToStringAttribute(cssImg)}" />`;
    }
    //
    else {
      console.log(item.data);
      throw new Error('Bad image data');
    }

    return `<div style="${props.styleToStringAttribute(cssContainer)}">
			${img}
		</div>\n`;
  },

  RenderProperties: function (props) {
    const item = props.item as ImageData;
    const [showModal, setShowModal] = useState<boolean>(false);
    return (
      <>
        <InputApplyOnEnter
          component={TextField}
          value={item.formula}
          onChange={val => props.setItem({ ...item, formula: val })}
          label={Trans('formula')}
          id="img-formula"
          InputProps={inputFAdornment}
        />

        <InputApplyOnEnter
          component={TextField}
          value={item.url}
          onChange={val => props.setItem({ ...item, url: val })}
          label={Trans('url')}
          id="img-url"
          InputProps={inputFAdornment}
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

        <SectionName text={Trans('size')} />

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
          label={Trans('width')}
          id="img-width"
          InputProps={inputFAdornment}
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
          label={Trans('height')}
          id="img-height"
          InputProps={inputFAdornment}
          helperText={WidthOptions}
        />

        <TextField
          select
          label={Trans('img-fit')}
          value={
            !!item.fit && !!item.width && !!item.height ? item.fit : 'fill'
          }
          onChange={val => {
            const val2: ImageData = { ...item };
            if (val) {
              val2.fit = val.target.value as any;
            } else {
              delete val2.fit;
            }
            return props.setItem(val2);
          }}
          id="Image-fit"
          disabled={!item.width || !item.height}
        >
          <MenuItem value="fill">{Trans('img-fit-fill')}</MenuItem>
          <MenuItem value="contain">{Trans('img-fit-contain')}</MenuItem>
          <MenuItem value="cover">{Trans('img-fit-cover')}</MenuItem>
        </TextField>

        <SectionName text={Trans('align')} />
        <PropertyAlign
          value={item.align}
          onChange={val => props.setItem({ ...item, align: val })}
        />
        <SimpleDialog
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          title={Trans('select image')}
        >
          <FileDialog
            mode="value"
            value={
              item.url && item.url.startsWith('local/')
                ? item.url.substring(6)
                : ''
            }
            onChange={val => {
              setShowModal(false);
              props.setItem({
                ...item,
                url: val && val.length > 0 ? `local/${val}` : '',
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
