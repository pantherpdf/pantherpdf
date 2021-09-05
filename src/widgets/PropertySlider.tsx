import React, { useState, useEffect } from 'react'

interface Props {
	min: number,
	max: number,
	value: number,
	onChange: (val: number) => void,
}

export default function PropertySlider(props: Props) {
	const [value, setValue] = useState<number>(props.value)

	useEffect(() => {
		setValue(props.value)
	}, [props.value])

	// only call onChange() when user releases mouse
	useEffect(() => {
		window.document.documentElement.addEventListener('mouseup', mouseup);
		return () => {
			window.document.documentElement.removeEventListener('mouseup', mouseup);
		}
	})
	const mouseup = () => {
		if (value !== props.value) {
			props.onChange(value)
		}
	}

	return <input
		type='range'
		min={props.min}
		max={props.max}
		value={value}
		onChange={e => setValue(parseInt(e.currentTarget.value))}
		className='form-range'
	/>
}
