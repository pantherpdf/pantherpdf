/**
 * ReportSettings.tsx
 * General settings/properties of a report
 */


import React, { useState } from 'react'
import { GeneralProps, TargetOptions, TargetOptionTypeGuard, TReport } from './types'
import Trans, { TransName } from '../translation'
import PropertyFont, { TFont } from '../widgets/PropertyFont'
import InputApplyOnEnter from '../widgets/InputApplyOnEnter'
import Property4SideInput, { Value as Property4SideInputValue } from '../widgets/Property4SideInput'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretUp, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'


export default function ReportSettings(props: GeneralProps) {
	const [showMore, setShowMore] = useState<boolean>(false)

	async function changeName() {
		const txt = prompt(Trans('new name'), TransName(props.report.name))
		if( !txt )
			return
		const obj = {...props.report, name: txt}
		return props.setReport(obj)
	}

	async function changeTarget(e: React.ChangeEvent<HTMLSelectElement>) {
		const value = e.currentTarget.value
		if (!TargetOptionTypeGuard(value))
			return
		const obj: TReport = {...props.report, target: value}
		return props.setReport(obj)
	}

	async function changeFont(value: TFont) {
		const obj: TReport = {...props.report, properties: {...props.report.properties}}
		if (Object.keys(value).length > 0) {
			obj.properties.font = value
		}
		else {
			delete obj.properties.font
		}
		return props.setReport(obj)
	}

	async function changeMargin(value: Property4SideInputValue) {
		const obj: TReport = {...props.report, properties: {...props.report.properties}}
		obj.properties.margin = value
		return props.setReport(obj)
	}

	async function changeProperty(key: keyof typeof props.report.properties, value: string|number) {
		const obj: TReport = {...props.report, properties: {...props.report.properties}};
		     if (key === 'fileName' && typeof value === 'string') { obj.properties[key] = value }
		else if (key === 'lang' && typeof value === 'string') { obj.properties[key] = value }
		else if (key === 'paperWidth' && typeof value === 'number') { obj.properties[key] = value }
		else if (key === 'paperHeight' && typeof value === 'number') { obj.properties[key] = value }
		else { throw new Error('bad value') }
		return props.setReport(obj)
	}

	async function deleteProperty(key: keyof typeof props.report.properties) {
		const obj: TReport = {...props.report, properties: {...props.report.properties}};
		delete obj.properties[key]
		return props.setReport(obj)
	}

	async function deleteReport() {
		if (!window.confirm(Trans('delete report question')))
			return
		return props.deleteReport()
	}


	const margin: Property4SideInputValue = props.report.properties.margin ? props.report.properties.margin : [0,0,0,0]
	return <>
		<label>{Trans('name')}</label>
		<div className="input-group mb-3">
			<input type="text" className="form-control" disabled value={TransName(props.report.name)}/>
				<button className="btn btn-sm btn-outline-secondary" onClick={changeName}>
					<FontAwesomeIcon icon={faEdit} />
				</button>
		</div>

		<div>
			<button className="btn btn-sm btn-outline-danger" onClick={deleteReport}>
				<FontAwesomeIcon icon={faTrash} className='me-2' /> {Trans('delete report')}
			</button>
		</div>
		
		<div className='mt-3'>
			<button className='btn btn-sm btn-outline-primary mr-4' onClick={() => setShowMore(!showMore)}>
				{Trans(showMore ? 'show less' : 'show more')} <FontAwesomeIcon icon={showMore ? faCaretUp : faCaretDown} />
			</button>
		</div>

		{showMore && <>
			<div>
				<label htmlFor='target'>{Trans('target')}</label>
				<select className='form-control' id='target' value={props.report.target} onChange={changeTarget}>
					{TargetOptions.map(tp => <option key={tp} value={tp}>{tp}</option>)}
				</select>
			</div>
			<div>
				<label htmlFor='fileName'>{Trans('fileName')}</label>
				<div className="input-group mb-3">
					<span className="input-group-text">ƒ</span>
					<input type='text' id='fileName' value={props.report.properties.fileName||''} onChange={e=>e.target.value.length>0?changeProperty('fileName',e.target.value):deleteProperty('fileName')} className='form-control' />
				</div>
			</div>

			<PropertyFont value={props.report.properties.font?props.report.properties.font:{}} onChange={changeFont} />
			
			<label htmlFor='paperWidth'>{Trans('paperWidth')} <small className='text-muted'>{Trans('0 means default')}</small></label>
			<div className="input-group">
				<InputApplyOnEnter id='paperWidth' min='0' max='10000' value={props.report.properties.paperWidth?props.report.properties.paperWidth:0} onChange={val=>val?changeProperty('paperWidth',val):deleteProperty('paperWidth')} />
				<span className="input-group-text">mm</span>
			</div>

			<label htmlFor='paperHeight'>{Trans('paperHeight')} <small className='text-muted'>{Trans('0 means default')}</small></label>
			<div className="input-group">
				<InputApplyOnEnter id='paperHeight' min='0' max='10000' value={props.report.properties.paperHeight?props.report.properties.paperHeight:0} onChange={val=>val?changeProperty('paperHeight',val):deleteProperty('paperHeight')} />
				<span className="input-group-text">mm</span>
			</div>

			<label>{Trans('margin')} <small className='text-muted'>mm</small></label>
			<Property4SideInput value={margin} onChange={changeMargin} />

			<label htmlFor='lang'>{Trans('lang')} <small className='text-muted'>{Trans('lang 2 letter code')}</small></label>
			<InputApplyOnEnter id='lang' value={props.report.properties.lang?props.report.properties.lang:''} onChange={val=>(typeof val==='string'&&val.length>0)?changeProperty('lang',val):deleteProperty('lang')} />
		</>}
			
	</>
}
