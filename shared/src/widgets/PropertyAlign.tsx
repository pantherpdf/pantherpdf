/**
 * PropertyAlign.tsx
 */


import { faAlignCenter, faAlignJustify, faAlignLeft, faAlignRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { tuple } from '../types'


export const TAligns = tuple('left', 'center', 'right', 'justify');
export type TAlign = (typeof TAligns)[number];

interface AlignProps {
	value: TAlign|undefined,
	onChange: (value: TAlign|undefined) => void,
}

export default function PropertyAlign(props: AlignProps) {
	const icons: {[key in TAlign]: IconDefinition} = {
		'left': faAlignLeft,
		'center': faAlignCenter,
		'right': faAlignRight,
		'justify': faAlignJustify,
	}
	return <div>
		<div className='btn-group'>
			{TAligns.map(x => <button
				key={x}
				className={`btn btn-outline-secondary ${x === props.value ? 'active' : ''}`}
				onClick={() => props.onChange(x!==props.value ? x : undefined)}
			>
				<FontAwesomeIcon icon={icons[x]} fixedWidth />
			</button>)}
		</div>
	</div>
}
