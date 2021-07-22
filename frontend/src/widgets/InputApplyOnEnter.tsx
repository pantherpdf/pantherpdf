/**
 * InputApplyOnEnter.tsx
 * Helper form input that calls onChange only when focus is lost or when user presses enter.
 */

import React, { Component } from 'react'
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
}

interface State {
	originalValue: TAllowed,
	currentValue: string,
}

export default class InputApplyOnEnter extends Component<Props, State> {
	constructor(props: Props) {
		super(props)

		this.state = {
			originalValue: props.value,
			currentValue: (typeof props.value === 'number' ? props.value.toString() : (props.value || '')),
		}
	}

	static getDerivedStateFromProps(props: Props, prevState: State) {
		if( props.value !== prevState.originalValue )
			return {
				originalValue: props.value,
				currentValue: (props.value!==undefined) ? (typeof props.value === 'number' ? props.value.toString() : props.value) : '',
			}
		return null
	}

	applyValue() {
		if ( typeof this.props.value === 'number' ) {
			const val = (Number.isInteger(this.props.step) && this.props.step !== 0) ? parseInt(this.state.currentValue) : parseFloat(this.state.currentValue)
			if( isFinite(val) && !isNaN(val) ) {
				if( val !== this.state.originalValue ) {
					this.props.onChange(val)
				}
			}
			else {
				alert(Trans('invalid value'))
				this.setState(prevState=>({currentValue:String(prevState.originalValue)}))
			}
		}
		else {
			if( this.props.regex ) {
				const regexOk = this.props.regex.test(this.state.currentValue)
				if( this.state.currentValue !== this.state.originalValue && !regexOk ) {
					alert(Trans('invalid value')+' '+JSON.stringify(this.state.currentValue))
					return
				}
			}
			if( this.state.currentValue !== this.state.originalValue ) {
				this.props.onChange(this.state.currentValue)
			}
		}
	}

	render() {
		return <input
			{...this.props}
			type={typeof this.props.value}
			value={this.state.currentValue}
			onChange={e=>this.setState({currentValue:e.target.value})}
			onKeyDown={e => {
				if (e.key==='Enter') {
					this.applyValue();
				}
				if(e.key==='Escape') {
					this.setState(prevState=>({currentValue:String(prevState.originalValue)}))
				}
			}}
			onBlur={()=>this.applyValue()}
			className="form-control"
		/>
	}
}
