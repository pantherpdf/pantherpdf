/**
 * ObjectExplorer.tsx
 * Visualize sourceData
 */


import React, { Component } from 'react'
import style from './ObjectExplorer.module.css'
import Trans from '../translation'


interface Props {
	data: unknown,
}

interface State {
	data: unknown,
	expanded: {[key: string]: boolean},
	promiseResolved: boolean | {[key: string]: unknown},
	promiseResult: unknown,
	funcResolved: {[key: string]: boolean},
	funcResult: {[key: string]: unknown},
}


export default class ObjectExplorer extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = ObjectExplorer.reset(props.data)
	}

	static reset(data: unknown): State {
		return {
			data: data,
			expanded: {},
			promiseResolved: false,
			promiseResult: null,
			funcResolved: {},
			funcResult: {},
		}
	}

	static getDerivedStateFromProps(props: Props, prevState: State) {
		if( props.data !== prevState.data ) {
			const state = ObjectExplorer.reset(props.data)
			return state
		}
		return null
	}

	componentDidMount() {
		if( this.state.data && typeof this.state.data === 'object' && Promise.resolve(this.state.data) === this.state.data ) {
			(this.state.data as Promise<unknown>).then(dt => this.setState({promiseResolved: true, promiseResult: dt}))
		}
	}

	isExpanded(key: string) {
		return this.state.expanded[key]
	}

	renderIcon(key: string, dt: unknown) {
		if (typeof this.state.promiseResolved === 'object' && this.state.promiseResolved && key in this.state.promiseResolved )
			return <span style={{fontSize:'50%'}}>prms</span>
		if( dt === null || dt === undefined )
			return <span style={{fontSize:'50%'}}>nul</span>
		if( dt === false || dt === true )
			return <span style={{fontSize:'50%'}}>bool</span>
		if( typeof dt === 'number' )
			return '#'
		if( typeof dt === 'function' )
			return '𝑓'  // ⨍𝑓
		if( typeof dt === 'string' )
			return <span style={{fontSize:'70%'}}>txt</span>

		if( Array.isArray(dt) )
			return '[]'
		
		return '{}'
	}

	renderItemExpand(name: string, key: string, dt: unknown) {
		const canExpand = dt && (typeof dt === 'object' || typeof dt === 'function')
		return <div key={key}>
			<div className={style.row}>
				<div className={style.btnCont}>
					{canExpand && !this.isExpanded(key) && <button className='btn btn-sm pt-0' onClick={e=>{e.preventDefault(); this.expand(key, dt)}}>+</button>}
					{canExpand &&  this.isExpanded(key) && <button className='btn btn-sm pt-0' onClick={e=>{e.preventDefault(); this.collapse(key, dt)}}>-</button>}
				</div>
				<div className={style.icon}>
					<span className='text-muted'>
						{this.renderIcon(key, dt)}
					</span>
				</div>
				<div style={{flex:'1'}} onClick={e=>{e.preventDefault(); if(this.state.expanded[key]){this.collapse(key,dt)}else{this.expand(key,dt)}}}>
					{name}
				</div>
				{!canExpand && <ObjectExplorer data={dt} />}
			</div>
			{canExpand && this.isExpanded(key) && <div className={style.child}>
				<ObjectExplorer data={typeof dt === 'function' ? this.state.funcResult[key] : dt} />
			</div>}
		</div>
	}

	change_funcResult(key: string, value: unknown) {
		this.setState((prevState) => {
			const fr = {...prevState.funcResult}
			fr[key] = value
			return { funcResult: fr }
		})
	}

	change_funcResolved(key: string, value: boolean) {
		this.setState((prevState) => {
			const fr = {...prevState.funcResolved}
			fr[key] = value
			return { funcResolved: fr }
		})
	}

	change_expanded(key: string, value: boolean) {
		this.setState((prevState) => {
			const fr = {...prevState.expanded}
			fr[key] = value
			return { expanded: fr }
		})
	}

	expand(key: string, dt: unknown) {
		if( dt && typeof dt === 'function' && !this.state.funcResolved[key] ) {
			this.change_funcResult(key, dt())
			this.change_funcResolved(key, true)
		}
		this.change_expanded(key, true)
	}

	collapse(key: string, dt: unknown) {
		this.change_expanded(key, false)
	}

	renderArray() {
		const data = this.state.data as unknown[]
		if (data.length === 0 ) {
			return <div>
				<div>{'['}</div>
				<div><small className='text-muted'>{Trans('empty')}</small></div>
				<div>{']'}</div>
			</div>
		}
		return data.map((dt,idx) => this.renderItemExpand('['+idx+']', String(idx), dt))
	}

	renderObject() {
		const data = this.state.data as {[key: string]: unknown}
		if( Object.keys(data).length === 0 ) {
			return <div>
				<div>{'{'}</div>
				<div><small className='text-muted'>{Trans('empty')}</small></div>
				<div>{'}'}</div>
			</div>
		}
		return Object.keys(data).map(key => {
			if( key.substr(0,2) === '$$' )
				return null
			return this.renderItemExpand(key, key, data[key])
		})
	}

	renderPromise() {
		if( this.state.promiseResolved ) {
			return <ObjectExplorer data={this.state.promiseResult} />
		}
		return <i>loading ...</i>
	}

	renderFunction() {
		return null
	}

	renderOther() {
		return <pre className={style.pre}>{JSON.stringify(this.state.data)}</pre>
	}

	render() {
		if( this.state.data && Array.isArray(this.state.data) )
			return this.renderArray()
		if( this.state.data && typeof this.state.data === 'object' ) {
			if( Promise.resolve(this.state.data) === this.state.data ) {
				return this.renderPromise()
			}
			return this.renderObject()
		}
		if( this.state.data && typeof this.state.data === 'function' )
			return this.renderFunction()
		return this.renderOther()
	}
}
