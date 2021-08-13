/**
 * InputApplyOnEnter.tsx
 * Helper form input that calls onChange only when focus is lost or when user presses enter.
 */

import React, { useState, useEffect } from 'react'
import Trans from '../translation'

export const WidthRegex = /^(?:|\d+(?:\.\d+)?(?:mm|cm|px|%|rem|em|vw|vh|))$/
export const WidthOptions = 'mm|cm|px|%|rem|em|vw|vh'

type TAllowed = string | number

interface Props {
	value: TAllowed,
	step?: number,
	min?: string|number,
	max?: string|number,
	onChange: (val: TAllowed) => void
	regex?: RegExp,
	id?: string,
	style?: React.CSSProperties,
	placeholder?: string,
}

export default function InputApplyOnEnter(props: Props) {
	const [value, setValue] = useState<string>(String(props.value))
	const [origValue, setOrigValue] = useState<TAllowed>(props.value)

	useEffect(() => {
		setValue(String(props.value))
		setOrigValue(props.value)
	}, [props.value])


	function applyValue(): boolean {
		let value2: TAllowed

		// number
		if (typeof props.value === 'number') {
			const num = (Number.isInteger(props.step) && props.step !== 0) ? parseInt(value) : parseFloat(value)
			if (!isFinite(num) || isNaN(num)) {
				return false
			}
			if (String(num) !== value) {
				return false
			}
			value2 = num
		}
		
		// regex
		else if (props.regex) {
			const regexOk = props.regex.test(value)
			if (value !== origValue && !regexOk) {
				return false
			}
			value2 = value
		}
		
		// string
		else {
			value2 = value
		}

		// apply
		if (value2 !== origValue) {
			props.onChange(value2)
		}
		return true
	}

	return <input
		{...props}
		type={typeof props.value}
		value={value}
		onChange={e => setValue(e.currentTarget.value)}
		onKeyDown={e => {
			if (e.key==='Enter') {
				e.preventDefault()
				e.stopPropagation()
				if (!applyValue()) {
					alert(Trans('invalid value'))
				}
			}
			if(e.key==='Escape') {
				e.preventDefault()
				e.stopPropagation()
				setValue(String(origValue))
			}
		}}
		onBlur={() => {
			if (!applyValue()) {
				alert(Trans('invalid value'))
				setValue(String(origValue))
			}
		}}
		className="form-control"
	/>
}
