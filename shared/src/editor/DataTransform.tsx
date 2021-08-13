/**
 * DataTransform.tsx
 * Manage data transformations. Add, delete, edit TTransformWidget.
 */


import React, { useState } from 'react'
import { TReport, TTransformData } from '../types'
import { GeneralProps } from './types'
import { Dropdown, Button, ButtonGroup, Modal } from 'react-bootstrap'
import Trans, { TransName } from '../translation'
import getTransform, { allTransforms } from '../transforms/allTransforms'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faArrowUp, faEdit, faPlus, faTimes, faTrash, faRetweet } from '@fortawesome/free-solid-svg-icons'
import ObjectExplorer from './ObjectExplorer'
import FileSelect from '../FileSelect'


/**
 * Function for calling all transformations
 * @func
 * @param {inputData} any - Input data
 * @param {len} number - Number of transformations to apply
 */
export async function transformData(inputData: any, report: TReport, len?: number) {
	if (len === undefined) {
		len = report.transforms.length
	}
	for (let i=0; i<len; ++i) {
		const w = report.transforms[i]
		const comp = getTransform(w.type)
		inputData = await comp.transform(inputData, w)
	}
	return inputData
}


interface TransformItemProps extends GeneralProps {
	item: TTransformData,
	index: number,
	showData: (len: number) => void,
	up: (idx: number) => void,
	down: (idx: number) => void,
	itemDelete: (idx: number) => void,
	openEditor: (idx: number) => void,
}
function TransformItem(props: TransformItemProps) {
	const comp = getTransform(props.item.type)
	return <Dropdown
		as={ButtonGroup}
		className='d-flex'
		size='sm'
	>
		<button className='btn btn-sm btn-outline-secondary flex-fill text-left' onClick={()=>props.showData(props.index+1)}>
			{TransName(comp.name)} <small className='text-truncate d-inline-block ml-3 text-muted' style={{maxWidth:'5rem', position:'relative', top:'0.25rem'}}>{props.item.comment}</small>
		</button>
		<Dropdown.Toggle style={{maxWidth:'3rem'}} split variant="outline-secondary" id="dropdown-custom-2" />
		<Dropdown.Menu>
			<Dropdown.Item onClick={()=>props.openEditor(props.index)}>
				<FontAwesomeIcon icon={faEdit} className='me-2' fixedWidth />
				{Trans('edit')}
			</Dropdown.Item>
			<Dropdown.Item onClick={e=>{e.preventDefault(); props.up(props.index)}} disabled={props.index===0}>
				<FontAwesomeIcon icon={faArrowUp} className='me-2' fixedWidth />
				{Trans('up')}
			</Dropdown.Item>
			<Dropdown.Item onClick={e=>{e.preventDefault(); props.down(props.index)}} disabled={props.index+1===props.report.transforms.length}>
				<FontAwesomeIcon icon={faArrowDown} className='me-2' fixedWidth />
				{Trans('down')}
			</Dropdown.Item>
			<Dropdown.Divider />
			<Dropdown.Item onClick={e=>{e.preventDefault(); props.itemDelete(props.index)}}>
				<FontAwesomeIcon icon={faTrash} className='me-2' fixedWidth />
				{Trans('delete')}
			</Dropdown.Item>
		</Dropdown.Menu>
	</Dropdown>
}



interface TEdit {
	index: number,
	data: TTransformData,
}

interface TSourceDataShow {
	length?: number,
	data: any,
	errorMsg?: string,
}

export default function DataTransform(props: GeneralProps) {
	const [shownModalInsert, setShownModalInsert] = useState<boolean>(false)
	const [showEdit, setShowEdit] = useState<TEdit | null>(null)
	const [showData, setShowData] = useState<TSourceDataShow | null>(null)
	const [shownModalUpload, setShownModalUpload] = useState<boolean>(false)
	const [uploadUrl, setUploadUrl] = useState<string>('')

	async function doShowData(len: number) {
		let dt
		try {
			dt = props.getOriginalSourceData();
		}
		catch(e) {
			const msg = e instanceof Error ? e.message : 'Unknown error'
			setShowData({data: null, errorMsg: msg})
			return
		}
		
		let dt2
		try {
			dt2 = await transformData(dt, props.report, len)
		}
		catch(e) {
			const msg = e instanceof Error ? e.message : 'Unknown error'
			setShowData({data: null, errorMsg: msg})
			return
		}
		setShowData({data: dt2, length: len})
	}

	async function itemAdd(key: string) {
		const cmp = getTransform(key)
		const dt = await cmp.newItem()
		const report2: TReport = {...props.report, transforms:[...props.report.transforms, dt]}
		await props.setReport(report2)
		setShownModalInsert(false)
		setShowEdit({
			index: report2.transforms.length-1,
			data: JSON.parse(JSON.stringify(dt))
		})
	}

	async function itemUp(idx: number) {
		const report2: TReport = {...props.report, transforms:[...props.report.transforms]}
		const tmp = report2.transforms[idx-1]
		report2.transforms[idx-1] = report2.transforms[idx]
		report2.transforms[idx] = tmp
		return props.setReport(report2)
	}

	async function itemDown(idx: number) {
		const report2: TReport = {...props.report, transforms:[...props.report.transforms]}
		const tmp = report2.transforms[idx+1]
		report2.transforms[idx+1] = report2.transforms[idx]
		report2.transforms[idx] = tmp
		return props.setReport(report2)
	}

	async function itemDelete(idx: number) {
		const report2: TReport = {...props.report, transforms:[...props.report.transforms]}
		report2.transforms.splice(idx, 1)
		return props.setReport(report2)
	}

	function itemOpenEditor(idx: number) {
		setShowEdit({
			index: idx,
			data: JSON.parse(JSON.stringify(props.report.transforms[idx]))
		})
	}


	async function editSave() {
		if (!showEdit)
			return
		const report2: TReport = {...props.report, transforms:[...props.report.transforms]}
		report2.transforms[showEdit.index] = showEdit.data
		await props.setReport(report2)
		setShowEdit(null)
		props.refreshSourceData(report2)
	}

	function editChange(data: TTransformData) {
		if (showEdit)
			setShowEdit({...showEdit, data})
	}

	const editCmp = showEdit ? getTransform(showEdit.data.type) : null

	return <>
		<Dropdown
			as={ButtonGroup}
			className='d-flex'
			size='sm'
		>
			<button className='btn btn-sm btn-outline-secondary flex-fill text-left' onClick={()=>doShowData(0)}>
				{Trans('source data')}
			</button>
			<Dropdown.Toggle style={{maxWidth:'3rem'}} split variant="outline-secondary" id="dropdown-custom-2" />
			<Dropdown.Menu>
				<Dropdown.Item onClick={() => {
					setShownModalUpload(true)
				}}>
					<FontAwesomeIcon icon={faRetweet} className='me-2' fixedWidth />
					{Trans('replace')}
				</Dropdown.Item>
				{props.indexOverridenSourceData>0 && <Dropdown.Item onClick={() => {
					props.overrideSourceData(null)
				}}>
					<FontAwesomeIcon icon={faTimes} className='me-2' fixedWidth />
					{Trans('reset')}
				</Dropdown.Item>}
			</Dropdown.Menu>
		</Dropdown>


		{props.report.transforms.map((item, idx) => <TransformItem
			{...props}
			item={item}
			index={idx}
			key={idx}
			showData={doShowData}
			up={itemUp}
			down={itemDown}
			itemDelete={itemDelete}
			openEditor={itemOpenEditor}
		/>)}
		<div className=''>
			<button className='btn btn-sm btn-outline-secondary mt-2' onClick={()=>setShownModalInsert(true)}>
				<FontAwesomeIcon icon={faPlus} className='me-2' />
				{Trans('transform')}
			</button>
		</div>

		{/* UPLOAD JSON */}
		<Modal show={shownModalUpload} onHide={() => setShownModalUpload(false)}>
			<Modal.Header closeButton>
				<Modal.Title>
					Upload JSON data
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="mb-3">
					<label htmlFor="uploadUrl" className="form-label">
						Url
					</label>
					<input
						type="text"
						placeholder='https://www.example.com/file.json'
						className="form-control"
						id="uploadUrl"
						value={uploadUrl}
						onChange={e => setUploadUrl(e.currentTarget.value)}
					/>
				</div>
				
				<hr />

				<FileSelect
					onSelect={async fls => {
						if (fls.length === 0) {
							return
						}
						const f = fls[0]
						try {
							const reader = new FileReader()
							reader.onload = (e2) => {
								if (!e2.target || typeof e2.target.result !== 'string') {
									return
								}
								const dt = JSON.parse(e2.target.result)
								props.overrideSourceData(dt)
							}
							reader.readAsText(f)
						}
						catch(e) {
							alert(`Error: ${String(e)}`)
							return
						}
						setShownModalUpload(false)
					}}
				/>
			</Modal.Body>
			<Modal.Footer>
				<Button
					variant="secondary"
					onClick={() => {
						setShownModalUpload(false)
					}}
				>
					{Trans('cancel')}
				</Button>
				<Button
					variant="primary"
					onClick={async () => {
						let js: any
						try {
							const r = await fetch(uploadUrl)
							if (!r.ok) {
								alert('Bad response from url')
								return
							}
							js = await r.json()
						}
						catch(e) {
							alert(`Error: ${String(e)}`)
							return
						}
						setShownModalUpload(false)
						props.overrideSourceData(js)
					}}
					disabled={uploadUrl.length === 0}
				>
					Upload
				</Button>
			</Modal.Footer>
		</Modal>

		{/* ADD NEW */}
		<Modal show={shownModalInsert} onHide={() => setShownModalInsert(false)}>
			<Modal.Header closeButton>
				<Modal.Title>
					{Trans('insert data transform')}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="list-group">
					{Object.keys(allTransforms).map(key => {
						const w = allTransforms[key]
						return <button
							className='btn list-group-item list-group-item-action'
							key={key}
							onClick={()=>itemAdd(key)}
						>
							{TransName(w.name)}
						</button>
					})}
				</div>
			</Modal.Body>
		</Modal>

		{/* EDIT */}
		<Modal show={!!showEdit} onHide={() => setShowEdit(null)}>
			{editCmp && showEdit && <>
			<Modal.Header closeButton>
				<Modal.Title>
					{Trans('edit')} {TransName(editCmp.name)}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<editCmp.Editor
					{...props}
					index={showEdit.index}
					item={showEdit.data}
					setItem={editChange}
				/>
			</Modal.Body>
			<Modal.Footer>
				<input
					type='text'
					className='form-control flex-fill w-auto'
					id='trans-edit-comment'
					value={showEdit.data.comment}
					placeholder={Trans('comment')}
					onChange={e => editChange({...showEdit.data, comment: e.currentTarget.value})}
				/>
				<Button variant="secondary" onClick={() => setShowEdit(null)}>
					{Trans('cancel')}
				</Button>
				<Button variant="primary" onClick={editSave}>
					{Trans('save')}
				</Button>
			</Modal.Footer>
			</>}
		</Modal>

		{/* DATA */}
		<Modal show={!!showData} onHide={() => setShowData(null)}>
			<Modal.Header closeButton>
				<Modal.Title>
					{Trans('data')}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{showData?.data && <ObjectExplorer data={showData.data} />}
				{showData?.errorMsg && <div>{showData?.errorMsg}</div>}
			</Modal.Body>
		</Modal>
	</>
}
