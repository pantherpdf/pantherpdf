/**
 * PropColor.tsx
 */


import React, { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import style from './PropertyColor.module.css'

interface Props {
	value: string,
	onChange: (value: string) => void,
}

export default function PropertyColor(props: Props) {
	const [show, setShow] = useState<boolean>(false)
	const [value, setValue] = useState<string>(props.value)

	useEffect(() => {
		setValue(props.value)
	}, [props.value])

	// must use global listener
	// div.onMouseUp() is not called when user releases mouse outside of color selector
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

	return <div>
		<div className={ style.swatch } onClick={() => setShow(!show)}>
			<div className={ style.color } style={{backgroundColor:value}} />
		</div>
		{show && <div className={ style.popover }>
			<div className={ style.cover } onClick={() => setShow(false)} />
			<HexColorPicker
				color={value}
				onChange={setValue}
			/>
		</div>}
	</div>
}
