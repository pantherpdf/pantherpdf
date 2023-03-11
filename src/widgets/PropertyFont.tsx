import React, { useState, CSSProperties } from 'react'
import Trans from '../translation'
import { Popover, OverlayTrigger, Modal } from 'react-bootstrap'
import PropertyColor from './PropertyColor'
import InputApplyOnEnter, { WidthRegex, WidthOptions } from './InputApplyOnEnter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFont } from '@fortawesome/free-solid-svg-icons'
import { GoogleFontSelector } from './GoogleFonts'


type Narrowable = string | number | boolean | symbol | object | {} | void | null | undefined;
const tuple = <T extends Narrowable[]>(...args: T)=>args;

// could use csstype, but FontWeight has includes [number] instead of hard coded string numbers
// import type { Property } from 'csstype'     Property.FontWeight
const WeightOptions = tuple('normal','bold','100','200','300','400','500','600','700','800','900');
type TWeightOption = (typeof WeightOptions)[number];

const StyleOptions = tuple('normal','italic');
type TStyleOption = (typeof StyleOptions)[number];

export interface TFont {
	family?: string,
	size?: string,
	weight?: TWeightOption,
	style?: TStyleOption,
	color?: string,
	lineHeight?: number,
}


export interface TFontStyle {
	name: string,
	weight: number,
	italic: boolean,
}


const weightName: {[key in TWeightOption]: string} = {
	'normal': Trans('font-weight-normal'),
	'bold': Trans('font-weight-bold'),
	'100': '100',
	'200': '200',
	'300': '300',
	'400': '400',
	'500': '500',
	'600': '600',
	'700': '700',
	'800': '800',
	'900': '900',
}


const WeightOptionToNumeric: {[key in TWeightOption]: number} = {
	'normal': 400,
	'bold': 700,
	'100': 100,
	'200': 200,
	'300': 300,
	'400': 400,
	'500': 500,
	'600': 600,
	'700': 700,
	'800': 800,
	'900': 900,
}


const styleName: {[key in TStyleOption]: string} = {
	'normal': Trans('font-style-normal'),
	'italic': Trans('font-style-italic'),
}


const lineHeightOptions: {txt:string, value:number}[] = [
	{ txt: '66%', value: 0.666 },
	{ txt: '90%', value: 0.9 },
	{ txt: '100%', value: 1.0 },
	{ txt: '115%', value: 1.15 },
	{ txt: '150%', value: 1.5 },
	{ txt: '200%', value: 2.0 },
]


export function PropertyFontGenCss(obj: TFont): CSSProperties {
	const css: CSSProperties = {}
	if (obj.family) {
		css.fontFamily = obj.family+', sans-serif'
	}
	if (obj.size) {
		css.fontSize = obj.size
		if (typeof obj.lineHeight !== 'undefined') {
			const found = obj.size.match(/^\d*/gm)
			const txtDigits = (found && found.length > 0) ? found[0] : ''
			const sizeInt = parseInt(txtDigits)
			const ext = obj.size.substring(txtDigits.length)
			css.lineHeight = `${sizeInt*obj.lineHeight*1.25}${ext}`
		}
	}
	if (obj.weight && obj.weight.length > 0) {
		if ((obj.weight as any) >= 100 && (obj.weight as any) <= 900) {
			css.fontWeight = parseInt(obj.weight)
		}
		else {
			css.fontWeight = obj.weight as any
		}
	}
	if (obj.style && obj.style.length > 0) {
		css.fontStyle = obj.style
	}
	if (obj.color) {
		css.color = obj.color
	}
	return css
}


export function PropertyFontExtractStyle(obj: TFont): TFontStyle | undefined {
	if (!obj.family) {
		return undefined
	}
	const w = obj.weight || 'normal'
	return {
		name: obj.family,
		weight: WeightOptionToNumeric[w],
		italic: obj.style === 'italic',
	}
}


interface Props {
	value: TFont,
	onChange: (obj: TFont) => void,
	textButton?: boolean,
	iconButton?: boolean,
	id?: string,
	googleFontApiKey?: string,
}
export default function PropertyFont(props: Props) {
	const [showModal, setShowModal] = useState<boolean>(false)

	function handleInputChange(event: React.FormEvent<HTMLSelectElement|HTMLInputElement>) {
		const target = event.target as any;
		let value1: string|boolean = target.type === 'checkbox' ? target.checked : target.value;
		let value: string|boolean|number = value1
		const name: string = target.name;
		if (typeof value1 === 'string' && target.type === 'number') { if( target.step === 1 ) { value = parseInt(value1) } else { value = parseFloat(value1) } if(!Number.isFinite(value)){value=''} }

		const obj: any = {...props.value}

		if (typeof value === 'string' && value === '') {
			delete obj[name]
		}
		else {
			obj[name] = value
		}

		props.onChange(obj as TFont)
	}

	function renderBtn() {
		if(props.textButton) {
			return <button
				className='btn link'
				onClick={e=>{e.preventDefault()}}
			>
				{Trans('font')}
			</button>
		}

		if(props.iconButton) {
			return <button
				className='btn link'
				onClick={e=>{e.preventDefault()}}
				title={Trans('font')}
			>
				<FontAwesomeIcon icon={faFont} fixedWidth />
			</button>
		}
		
		return <button
			className="btn btn-sm btn-outline-secondary"
		>
			<FontAwesomeIcon icon={faFont} className='me-2' />
			{Trans('font')}
		</button>
	}


	const family = props.value.family || ''
	const size = props.value.size || ''
	const lineHeight = props.value.lineHeight || 0
	const weight = props.value.weight || ''
	const style = props.value.style || ''
	const color = props.value.color || ''

	const popover = <Popover className='p-3' id={props.id||''}>
		<div className="d-flex">
			<label htmlFor="family" style={{width:'50%'}}>
				{Trans('font-family')}
			</label>
			<div className='input-group'>
				<InputApplyOnEnter
					className='form-control'
					value={family}
					onChange={val => {
						if (val && String(val).length > 0) {
							return props.onChange({...props.value, family: String(val)})
						}
						else {
							const val3: TFont = {...props.value}
							delete val3.family
							return props.onChange(val3)
						}
					}}
					id='family'
				/>
				{props.googleFontApiKey && <button
					className='btn btn-outline-secondary'
					onClick={() => setShowModal(true)}
				>
					...
				</button>}
			</div>
		</div>
		<div className="d-flex">
			<label htmlFor="size" style={{width:'50%'}}>{Trans('font-size')}</label>
			<div>
				<InputApplyOnEnter id="size" value={size} onChange={val => props.onChange({...props.value, size: String(val)})} regex={WidthRegex} />
				<small className='text-muted'>{WidthOptions}</small>
			</div>
		</div>
		{size.length > 0 && (
		<div className="d-flex">
			<label htmlFor="lineHeight" style={{width:'50%'}}>
				{Trans('font-line-height')}
			</label>
			<select
				className="form-select"
				name="lineHeight"
				id="lineHeight"
				value={lineHeight}
				onChange={e => {
					const obj: TFont = {...props.value}
					if (e.currentTarget.value) {
						obj.lineHeight = parseFloat(e.currentTarget.value)
					}
					else {
						delete obj.lineHeight
					}
					props.onChange(obj)
				}}
			>
				<option value=""></option>
				{lineHeightOptions.map(w => <option value={w.value} key={w.value}>
					{w.txt}
				</option>)}
			</select>
		</div>
		)}
		<div className="d-flex">
			<label htmlFor="weight" style={{width:'50%'}}>{Trans('font-weight')}</label>
			<select className="form-select" name="weight" id="weight" value={weight} onChange={handleInputChange}>
				<option value=""></option>
				{WeightOptions.map(w => <option value={w} key={w}>{weightName[w]}</option>)}
			</select>
		</div>
		<div className="d-flex">
			<label htmlFor="style" style={{width:'50%'}}>{Trans('font-style')}</label>
			<select className="form-select" name="style" id="style" value={style} onChange={handleInputChange}>
				<option value=""></option>
				{StyleOptions.map(w => <option value={w} key={w}>{styleName[w]}</option>)}
			</select>
		</div>
		<div className="d-flex">
			<label htmlFor="color" style={{width:'50%'}}>{Trans('color')}</label>
			<div style={{width:'100%'}}>
				<div className="form-check">
					<input
						type='checkbox'
						id='font-enable'
						className="form-check-input"
						checked={color.length>0}
						onChange={e=>{if(e.target.checked){props.onChange({...props.value, color:'#000000'})}else{const obj={...props.value};delete obj.color; props.onChange(obj)}}}
					/>
					<label className="form-check-label" htmlFor="font-enable">
						{Trans('enable')}
					</label>
				</div>
				{color.length>0 && <PropertyColor value={color} onChange={val=>props.onChange({...props.value, color:val})} />}
			</div>
		</div>
	</Popover>
	return <>
		<OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
			{renderBtn()}
		</OverlayTrigger>

		<Modal
			show={showModal}
			onHide={() => setShowModal(false)}
		>
			<Modal.Header closeButton>
				<Modal.Title>
					{Trans('font-select-family')}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{showModal && props.googleFontApiKey && <GoogleFontSelector
					apiKey={props.googleFontApiKey}
					value={family}
					onChange={x => {
						const obj: TFont = {...props.value}
						if (x) {
							obj.family = x
						}
						else {
							delete obj.family
						}
						props.onChange(obj as TFont)
						setShowModal(false)
					}}
				/>}
			</Modal.Body>
		</Modal>
	</>
}
