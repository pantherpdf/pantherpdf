/**
 * Image.tsx
 */


import React, { useState, CSSProperties } from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import { faEllipsisH, faImage } from '@fortawesome/free-solid-svg-icons'
import BoxName from './BoxName'
import InputApplyOnEnter, { WidthOptions, WidthRegex } from './InputApplyOnEnter'
import PropertyAlign, { TAlign } from './PropertyAlign'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Modal } from 'react-bootstrap'
import FileDialog from '../FileDialog'


export interface ImageData extends TData {
	type: 'Image',
	url: string,
	formula: string,
	align?: TAlign,
	width: string,
}

export interface ImageCompiled extends TDataCompiled {
	type: 'Image',
	data: string,
	align?: TAlign,
	width: string,
}



export const Image: Widget = {
	name: {en: 'Image'},
	icon: {fontawesome: faImage},

	newItem: async (): Promise<ImageData> => {
		return {
			type: 'Image',
			children: [],
			url: '',
			formula: '',
			width: '',
		}
	},

	compile: async (dt: ImageData, helpers): Promise<ImageCompiled> => {
		let data = dt.url
		if (data.length === 0) {
			const data2 = await helpers.evalFormula(dt.formula)
			if (typeof data2 !== 'string') {
				throw new Error('Image from formula not a string')
			}
			data = data2
		}
		return {
			type: dt.type,
			children: [],
			data,
			align: dt.align,
			width: dt.width,
		}
	},

	Render: function(props) {
		const item = props.item as ImageData
		const cssImg: CSSProperties = {
			display: 'inline-block',
		}
		if (item.width.length > 0) {
			cssImg.width = item.width
		}
		if (item.url.length === 0) {
			// div
			cssImg.minHeight = '50px'
			cssImg.backgroundColor = '#ddd'
		}
		const cssContainer: CSSProperties = { }
		if (item.align) {
			cssContainer.textAlign = item.align
		}
		return <BoxName name={Image.name}>
			<div style={cssContainer}>
				{item.url.length >  0 && <img src={item.url} alt='' style={cssImg} />}
				{item.url.length === 0 && <div style={cssImg} />}
			</div>
		</BoxName>
	},

	RenderProperties: function(props) {
		const item = props.item as ImageData
		const [showModal, setShowModal] = useState<boolean>(false)
		return <>
			<label htmlFor='img-formula'>
				Formula
			</label>
			<div className="input-group mb-3">
				<span className="input-group-text fst-italic">ƒ</span>
				<InputApplyOnEnter
					id='img-formula'
					value={item.formula}
					onChange={val => props.setItem({...item, formula: val})}
				/>
			</div>

			<label htmlFor='img-url'>
				Url
			</label>
			<div className="input-group mb-3">
				<InputApplyOnEnter
					id='img-url'
					value={item.url}
					onChange={val => props.setItem({...item, url: val})}
				/>
				<button
					className="btn btn-outline-secondary"
					onClick={() => setShowModal(true)}
				>
					<FontAwesomeIcon icon={faEllipsisH} />
				</button>
			</div>

			<label htmlFor="width">
				Width <span className="text-muted">{WidthOptions}</span>
			</label>
			<InputApplyOnEnter
				id="width"
				value={item.width}
				onChange={val => props.setItem({...item, width: val})}
				regex={WidthRegex}
			/>

			<PropertyAlign
				value={item.align}
				onChange={val => props.setItem({...item, align: val})}
			/>


			<Modal show={showModal} onHide={() => setShowModal(false)} size='lg'>
				<Modal.Header closeButton>
					<Modal.Title>
						Select image
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<FileDialog
						mode='value'
						value={(item.url && item.url.startsWith('local/')) ? item.url.substring(6) : ''}
						onChange={(val) => { setShowModal(false); props.setItem({...item, url: (val && val.length>0) ? `local/${val}` : ''}); }}
						api={props.api}
					/>
				</Modal.Body>
			</Modal>
		</>
	},

	RenderFinal: function(props) {
		const item = props.item as ImageCompiled
		const cssImg: CSSProperties = {
			display: 'inline-block',
		}
		if (item.width.length > 0) {
			cssImg.width = item.width
		}
		const cssContainer: CSSProperties = { }
		if (item.align) {
			cssContainer.textAlign = item.align
		}

		let img
		if (item.data === '') {
			return null
		}
		else if (item.data.trimStart().startsWith('<svg')) {
			img = <div style={cssImg} dangerouslySetInnerHTML={{__html: item.data}}></div>
		}
		else if (item.data.startsWith('local/')) {
			img = <div>TODO</div>
		}
		else if (item.data.startsWith('data:image/') || item.data.startsWith('http://') || item.data.startsWith('https://')) {
			img = <img src={item.data} alt='' style={cssImg} />
		}
		else {
			img = <div>Bad img</div>
		}

		return <BoxName name={Image.name}>
			<div style={cssContainer}>
				{img}
			</div>
		</BoxName>
	},
}
