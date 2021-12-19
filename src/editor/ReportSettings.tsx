/**
 * ReportSettings.tsx
 * General settings/properties of a report
 */


import React, { useState } from 'react'
import { GeneralProps } from './types'
import type { TargetOption, TReport } from '../types'
import Trans from '../translation'
import PropertyFont, { TFont } from '../widgets/PropertyFont'
import InputApplyOnEnter from '../widgets/InputApplyOnEnter'
import Property4SideInput, { Value as Property4SideInputValue } from '../widgets/Property4SideInput'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import VarEditor from './VarEditor'


// hack to get array of possible values
// because I can only import types from shared
const TargetOptionTmpObj: {[key in TargetOption]: number} = { 'pdf': 1, 'html': 1, 'json': 1, 'csv-utf-8': 1, 'csv-windows-1250': 1, }
const TargetOptionTmpKeys = Object.keys(TargetOptionTmpObj)


export default function ReportSettings(props: GeneralProps) {
	const [showMore, setShowMore] = useState<boolean>(false)

	async function changeTarget(e: React.ChangeEvent<HTMLSelectElement>) {
		const value = e.currentTarget.value
		const obj: TReport = {...props.report, target: value as TargetOption}
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

	const margin: Property4SideInputValue = props.report.properties.margin ? props.report.properties.margin : [0,0,0,0]
	return <>
		<div className='hform'>
			<label htmlFor='report-name'>
				{Trans('name')}
			</label>
			<div className='input-group'>
				<InputApplyOnEnter
					id='report-name'
					value={props.report.name}
					onChange={val => {
						const obj = {...props.report, name: String(val)}
						return props.setReport(obj)
					}}
				/>
			</div>
		</div>

		<div className='hform'>
			<label htmlFor='target'>
				{Trans('target')}
			</label>
			<select
				className='form-select'
				id='target'
				value={props.report.target}
				onChange={changeTarget}
			>
				{TargetOptionTmpKeys.map(tp => <option key={tp} value={tp}>{tp}</option>)}
			</select>
		</div>
		
		<div className='mb-3'>
			<button className='btn btn-sm btn-outline-primary' onClick={() => setShowMore(!showMore)}>
				<FontAwesomeIcon icon={showMore ? faCaretUp : faCaretDown} className='me-2' />
				{Trans(showMore ? 'show less' : 'show more')}
			</button>
		</div>

		{showMore && <>
			
			<div className='hform'>
				<label htmlFor='fileName'>
					{Trans('fileName')}
				</label>
				<div className='input-group'>
					<span className="input-group-text fst-italic">ƒ</span>
					<InputApplyOnEnter id='fileName' value={props.report.properties.fileName||''} onChange={val=>(typeof val==='string'&&val.length>0)?changeProperty('fileName',val):deleteProperty('fileName')} />
				</div>
			</div>

			<div className='hform'>
				<label htmlFor='lang'>
					{Trans('lang')} <small className='text-muted'>{Trans('lang 2 letter code')}</small>
				</label>
				<InputApplyOnEnter
					id='lang'
					value={props.report.properties.lang||''}
					onChange={val=>(typeof val==='string'&&val.length>0)?changeProperty('lang',val):deleteProperty('lang')}
				/>
			</div>

			{props.report.target === 'pdf' && <>

				<div className='hform'>
					<label>
						{Trans('font')}
					</label>
					<div className='input-group'>
						<PropertyFont
							value={props.report.properties.font?props.report.properties.font:{}}
							onChange={changeFont}
							googleFontApiKey={props.api.googleFontApiKey}
						/>
					</div>
				</div>

				<div className='section-name'>
					{Trans('paper')}
					<small className='text-muted ms-2'>
						{Trans('0 means default')}
					</small>
				</div>
				
				<div className='hform'>
					<label htmlFor='paperWidth'>
						{Trans('width')}
					</label>
					<div className='input-group'>
						<InputApplyOnEnter id='paperWidth' min='0' max='10000' value={props.report.properties.paperWidth?props.report.properties.paperWidth:0} onChange={val=>val?changeProperty('paperWidth',val):deleteProperty('paperWidth')} />
						<span className="input-group-text">mm</span>
					</div>
				</div>

				<div className='hform'>
					<label htmlFor='paperHeight'>
						{Trans('height')}
					</label>
					<div className='input-group'>
						<InputApplyOnEnter id='paperHeight' min='0' max='10000' value={props.report.properties.paperHeight?props.report.properties.paperHeight:0} onChange={val=>val?changeProperty('paperHeight',val):deleteProperty('paperHeight')} />
						<span className="input-group-text">mm</span>
					</div>
				</div>

				<div className='section-name'>
					{Trans('margin')}
					<small className='text-muted ms-2'>mm</small>
				</div>
				<Property4SideInput value={margin} onChange={changeMargin} />
			</>}

			<VarEditor {...props} />
		</>}
			
	</>
}
