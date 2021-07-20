/**
 * PropColor.tsx
 */


import React, { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import style from './PropertyColor.module.css'

interface Props {
	value: string,
	onChange: (value: string) => Promise<void>,
}

export default function PropertyColor(props: Props) {
	const [show, setShow] = useState<boolean>(false)

	return <div>
		<div className={ style.swatch } onClick={() => setShow(!show)}>
			<div className={ style.color } style={{backgroundColor:props.value}} />
		</div>
		<div className={ style.popover }>
			<div className={ style.cover } onClick={() => setShow(false)} />
			<HexColorPicker color={props.value} onChange={props.onChange} />
		</div>
	</div>
}
