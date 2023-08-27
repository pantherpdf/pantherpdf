/**
 * Image.tsx
 */

import React, { useState, CSSProperties } from 'react';
import { TData, TDataCompiled } from '../types';
import type { Widget } from '../editor/types';
import { faEllipsisH, faImage } from '@fortawesome/free-solid-svg-icons';
import BoxName from './BoxName';
import InputApplyOnEnter, {
  WidthOptions,
  WidthRegex,
} from './InputApplyOnEnter';
import PropertyAlign, { TAlign } from './PropertyAlign';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from 'react-bootstrap';
import FileDialog from '../FileDialog';
import Trans from '../translation';
import base64ArrayBuffer from './base64ArrayBuffer';
import globalStyle from '../globalStyle.module.css';

export interface ImageData extends TData {
  type: 'Image';
  url: string;
  formula: string;
  align?: TAlign;
  width?: string;
  height?: string;
  fit?: 'fill' | 'contain' | 'cover';
}

export interface ImageCompiled extends TDataCompiled {
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
  icon: { fontawesome: faImage },

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

  Render: function (props) {
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
          <span
            className="font-monospace text-nowrap overflow-hidden"
            style={{ fontSize: '70%', opacity: '0.3' }}
          >
            {item.formula}
          </span>
        </div>
      );
    }
    //
    else {
      img = (
        <small className="d-block text-muted">
          {Trans('no image selected')}
        </small>
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

  RenderFinal: function (props) {
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
        <div className={globalStyle.vform}>
          <label htmlFor="img-formula">{Trans('formula')}</label>
          <div className="input-group">
            <span className="input-group-text fst-italic">ƒ</span>
            <InputApplyOnEnter
              id="img-formula"
              value={item.formula}
              onChange={val => props.setItem({ ...item, formula: val })}
            />
          </div>
        </div>

        <div className={globalStyle.vform}>
          <div>
            <label htmlFor="img-url">{Trans('url')}</label>
            <button
              className="btn btn-outline-secondary ms-3"
              onClick={() => setShowModal(true)}
            >
              <FontAwesomeIcon icon={faEllipsisH} />
            </button>
          </div>
          <InputApplyOnEnter
            id="img-url"
            value={item.url}
            onChange={val => props.setItem({ ...item, url: val })}
            placeholder="https://www.example.com/image.jpg"
          />
        </div>

        <div className={globalStyle.section}>{Trans('size')}</div>

        <div className={`${globalStyle.hform} mb-0`}>
          <label htmlFor="width">{Trans('width')}</label>
          <InputApplyOnEnter
            id="width"
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
          />
        </div>
        <small className="text-muted d-block mb-3">{WidthOptions}</small>

        <div className={`${globalStyle.hform} mb-0`}>
          <label htmlFor="height">{Trans('height')}</label>
          <InputApplyOnEnter
            id="height"
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
          />
        </div>
        <small className="text-muted d-block mb-3">{WidthOptions}</small>

        <div className={`${globalStyle.hform} mb-0`}>
          <label htmlFor="fit">{Trans('img-fit')}</label>
          <select
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
            className="form-select"
            disabled={!item.width || !item.height}
            id="fit"
          >
            <option value="fill">{Trans('img-fit-fill')}</option>
            <option value="contain">{Trans('img-fit-contain')}</option>
            <option value="cover">{Trans('img-fit-cover')}</option>
          </select>
        </div>

        <div className={globalStyle.section}>{Trans('align')}</div>
        <div className="text-center">
          <PropertyAlign
            value={item.align}
            onChange={val => props.setItem({ ...item, align: val })}
          />
        </div>

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Select image</Modal.Title>
          </Modal.Header>
          <Modal.Body>
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
          </Modal.Body>
        </Modal>
      </>
    );
  },
};
