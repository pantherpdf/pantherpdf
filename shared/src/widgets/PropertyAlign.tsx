/**
 * PropertyAlign.tsx
 */


import { faAlignCenter, faAlignJustify, faAlignLeft, faAlignRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { tuple } from '../types'
import Trans, { trKeys } from '../translation';


export const TAligns = tuple('left', 'center', 'right', 'justify');
export type TAlign = (typeof TAligns)[number];

interface AlignProps {
	value: TAlign|undefined,
	onChange: (value: TAlign|undefined) => void,
}

export default function PropertyAlign(props: AlignProps) {
	const dt: {value: TAlign, icon: IconDefinition, transKey: trKeys}[] = [
		{ value: 'left', icon: faAlignLeft, transKey: 'align-left' },
		{ value: 'center', icon: faAlignCenter, transKey: 'align-center' },
		{ value: 'right', icon: faAlignRight, transKey: 'align-right' },
		{ value: 'justify', icon: faAlignJustify, transKey: 'align-justify' },
	]
	return <div>
		<div className='btn-group'>
			{dt.map(x => <button
				key={x.value}
				className={`btn btn-outline-secondary ${x.value === props.value ? 'active' : ''}`}
				onClick={() => props.onChange(x.value!==props.value ? x.value : undefined)}
				title={Trans(x.transKey)}
			>
				<FontAwesomeIcon icon={x.icon} fixedWidth />
			</button>)}
		</div>
	</div>
}
