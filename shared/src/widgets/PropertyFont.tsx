import React, { useState, CSSProperties } from 'react'
import Trans from '../translation'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import PropertyColor from './PropertyColor'
import InputApplyOnEnter, { WidthRegex, WidthOptions } from './InputApplyOnEnter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFont } from '@fortawesome/free-solid-svg-icons'


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


const styleName: {[key in TStyleOption]: string} = {
	'normal': Trans('font-style-normal'),
	'italic': Trans('font-style-italic'),
}


export function PropertyFontGenCss(obj: TFont): CSSProperties {
	const css: CSSProperties = {}
	if (obj.family)
		css.fontFamily = obj.family+', sans-serif'
	if (obj.size)
		css.fontSize = obj.size
	if (obj.weight && obj.weight.length > 0) {
		if ((obj.weight as any) >= 100 && (obj.weight as any) <= 900)
			css.fontWeight = parseInt(obj.weight)
		else
			css.fontWeight = obj.weight as any
	}
	if (obj.style && obj.style.length > 0)
		css.fontStyle = obj.style
	if (obj.color)
		css.color = obj.color
	return css
}


interface Props {
	value: TFont,
	onChange: (obj: TFont) => Promise<void>,
	textButton?: boolean,
	iconButton?: boolean,
	id?: string,
}
export default function PropertyFont(props: Props) {
	const [fonts, setFonts] = useState<string[]>(['arial','times new roman'])

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
		if(props.textButton)
			return <button className='btn link' onClick={e=>{e.preventDefault()}}>{Trans('font')}</button>

		if(props.iconButton)
			return <button className='btn link' onClick={e=>{e.preventDefault()}} title={Trans('font')}>
				<FontAwesomeIcon icon={faFont} fixedWidth />
			</button>
		
		return <button className="btn btn-sm btn-primary">{Trans('font')}</button>
	}


	const family = props.value.family || ''
	const size = props.value.size || ''
	const weight = props.value.weight || ''
	const style = props.value.style || ''
	const color = props.value.color || ''

	const popover = <Popover className='p-3' id={props.id||''}>
		<div className="d-flex">
			<label htmlFor="family" style={{width:'50%'}}>{Trans('font-family')}</label>
			<select className="form-select" name="family" id="family" value={family} onChange={handleInputChange}>
				<option value=""></option>
				{fonts.map(f => <option key={f} value={f}>{f}</option>)}
			</select>
		</div>
		<div className="d-flex">
			<label htmlFor="size" style={{width:'50%'}}>{Trans('font-size')}</label>
			<div>
				<InputApplyOnEnter id="size" value={size} onChange={val => props.onChange({...props.value, size: String(val)})} regex={WidthRegex} />
				<small className='text-muted'>{WidthOptions}</small>
			</div>
		</div>
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
				<label><input type='checkbox' className="form-control" checked={color.length>0} onChange={e=>{if(e.target.checked){props.onChange({...props.value, color:'#000000'})}else{const obj={...props.value};delete obj.color; props.onChange(obj)}}} /> {Trans('enable')}</label>
				{color.length>0 && <PropertyColor value={color} onChange={val=>props.onChange({...props.value, color:val})} />}
			</div>
		</div>
	</Popover>
	return <>
		<OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
			{renderBtn()}
		</OverlayTrigger>
	</>
}
