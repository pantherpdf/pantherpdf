/**
 * TextHtml.tsx
 */


import React, { useEffect, useState, useRef, CSSProperties } from 'react'
import { TData, TDataCompiled } from '../types'
import type { ItemRendeProps, Widget } from '../editor/types'
import BoxName from './BoxName'
import PropertyFont, { PropertyFontGenCss, TFont } from './PropertyFont'
import FormulaEvaluate from '../formula/formula'
import { faAlignCenter, faAlignJustify, faAlignLeft, faAlignRight, faBold, faItalic, faTag, faTrash, faUnderline, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FormulaHelper } from '../editor/compile'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { listOfFilters } from './formulaFilter'
import Trans, { TransName, trKeys } from '../translation'
import { removeFromList } from '../editor/childrenMgmt'


// returns <div> element of editor
function getEditor(wid: number[]): HTMLElement | null {
	return document.querySelector(`[data-wid='${wid.join(',')}']`)
}


// return first parent button
// node is usualy text
function getButtonFromSelection(node: Node, editor: HTMLElement): HTMLButtonElement | null {
	if (node === editor) {
		return null
	}
	if (node.nodeName === 'BUTTON') {
		return node as HTMLButtonElement
	}
	if (node.parentNode) {
		return getButtonFromSelection(node.parentNode, editor)
	}
	return null
}


// make number path from editor to child node
function getPidFromNode(node: Node, editor: HTMLElement): number[] {
	const arr: number[] = []
	while (true) {
		if (node === editor) {
			break
		}
		const parent = node.parentNode
		if (!parent) {
			throw new Error('Cant find pid 1')
		}
		let found = false
		for (let i=0; i<parent.childNodes.length; ++i) {
			if (parent.childNodes[i] === node) {
				arr.push(i)
				found = true
			}
		}
		if (!found) {
			throw new Error('Cant find pid 2')
		}
		node = parent
	}
	arr.reverse()
	return arr
}


// return nth child of editor
function getNodeFromPid(ids: number[], editor: HTMLElement): Node | null {
	let base: Node = editor
	for (const idx of ids) {
		if (idx >= base.childNodes.length) {
			return null
		}
		base = base.childNodes[idx]
	}
	return base
}


// Properties editor for tag <button>
function TagEditor(props: ItemRendeProps) {
	const [btn, setBtn] = useState<HTMLButtonElement|null>(null)

	// 
	useEffect(() => {
		function doit() {
			function getBtn(): HTMLButtonElement | null {
				const editor = getEditor(props.wid)
				if (!editor) {
					return null
				}
				const x = editorDetailsGet(props.wid)
				if (!x) {
					return null
				}
				const selected = getNodeFromPid(x.node, editor)
				if (!selected) {
					return null
				}
				return getButtonFromSelection(selected, editor)
			}
			const btn2 = getBtn()
			if (btn !== btn2) {
				setBtn(btn2)
			}
		}

		editorDetailsCbRegister(props.wid, doit)
		
		return () => {
			editorDetailsCbUnregister(props.wid, doit)
		}
		// eslint-disable-next-line
	}, [props.wid])

	if (!btn)
		return null

	const arr = [...listOfFilters].sort((a,b) => a.category <= b.category ? -1 : 1)
	
	return <>
		<h3>Tag</h3>

		{/*
		Doesnt work because when editing selection changes and btn becomes null
		<div>
			<label htmlFor='tag-filter'>
				Filter
			</label>
		</div>
		<InputApplyOnEnter
			value={btn.innerText}
			onChange={val => {
				btn.innerText = String(val)
				setSt(st+1)
			}}
		/>
		*/}

		<label htmlFor='tag-filter' className='d-block'>
			{Trans('filter')}
		</label>
		<select
			className='form-select'
			value={btn.getAttribute('data-filter') || ''}
			onChange={e => {
				btn.setAttribute('data-filter', e.currentTarget.value)
			}}
			id='tag-filter'
		>
			<option value=''></option>
			{arr.map((x, idx) => <React.Fragment key={x.id}>
				{idx !== 0 && x.category !== arr[idx-1].category && <option disabled>──────────</option>}
				<option
					value={x.id}
				>
					{x.name ? TransName(x.name) : x.id}
				</option>
			</React.Fragment>)}
		</select>
	</>
}


// evaluate during compile
// replace <button> with value of formula inside <button>
export async function evaluateFormulaInsideHtml(html: string, formulaHelper: FormulaHelper): Promise<string> {
	// parse html
	// on browser use createElement()
	// on nodejs use JSDOM library
	let parentEl: HTMLElement
	let doc2: Document
	if (typeof window === 'undefined') {
		const { JSDOM } = require('jsdom')
		const dom = new JSDOM(html)
		parentEl = dom.window.document.body
		doc2 = dom.window.document
	}
	else {
		parentEl = document.createElement('div')
		doc2 = window.document
	}

	function processBtn(el: Node, value: string): Node | null {
		if (el.nodeName === '#text') {
			return doc2.createTextNode(value)
		}
		if (el.childNodes.length === 0) {
			return null
		}
		// b, i, ...
		const el2 = el.cloneNode(false)
		while (el2.lastChild) {
			el2.removeChild(el2.lastChild)
		}
		for (let i = 0; i < el.childNodes.length; ++i) {
			const el3 = processBtn(el.childNodes[i], value)
			if (el3) {
				el2.appendChild(el3)
				return el2
			}
		}
		return null
	}

	async function process(el: Node): Promise<Node> {
		if (el.nodeName === 'BUTTON') {
			const btn = (el as HTMLButtonElement)
			const formula = btn.textContent
			if (formula === null) {
				return doc2.createTextNode('')
			}
			if (typeof formula !== 'string') {
				return doc2.createTextNode('ERROR')
			}
			let value = await FormulaEvaluate(formula, formulaHelper)
			// filter
			const filterName = btn.getAttribute('data-filter')
			if (filterName) {
				const filter = listOfFilters.find(x => x.id === filterName)
				if (!filter) {
					throw new Error(`Unknown filter ${filterName}`)
				}
				value = filter.func(value, [])
			}
			//
			const el2 = processBtn(el, value)
			return el2 ? el2.childNodes[0] : doc2.createTextNode(value)
		}

		// string
		if (el.nodeType !== 1) {
			return el.cloneNode(true)
		}

		// div, span, p ...
		const el2 = el.cloneNode(false)
		while (el2.lastChild) {
			el2.removeChild(el2.lastChild)
		}
		for (let i = 0; i < el.childNodes.length; ++i) {
			const el3 = await process(el.childNodes[i])
			el2.appendChild(el3)
		}
		return el2
	}

	const parentEl2 = await process(parentEl)
	return (parentEl2 as HTMLElement).innerHTML
}


// is node an indirect child of parent
function isNodeInside(node: Node, parent: Node): boolean {
	if (node === parent) {
		return true
	}
	if (node.parentNode && isNodeInside(node.parentNode, parent)) {
		return true
	}
	return false
}


// EditorDetails
// used for current caret position
// must save as indexes because browser changes nodes and otherwise we would be left with invalid node
interface EditorDetails {
	wid: number[],
	node: number[],
	offset: number,
	cbs: (() => void)[],
}
const _editorDetails: EditorDetails[] = []
function editorDetailsGet(wid: number[]): EditorDetails | null {
	const wid2 = wid.join(',')
	for (const obj of _editorDetails) {
		if (obj.wid.join(',') === wid2) {
			return obj
		}
	}
	return null
}
function editorDetailsGetOrInsert(wid: number[]): EditorDetails {
	const obj = editorDetailsGet(wid)
	if (obj) {
		return obj
	}
	const obj2 = { wid: wid, node:[], offset:0, cbs: [] }
	_editorDetails.push(obj2)
	return obj2
}
function editorDetailsRemove(wid: number[]): void {
	const wid2 = wid.join(',')
	const idx = _editorDetails.findIndex(x => x.wid.join(',') === wid2)
	if (idx !== -1) {
		_editorDetails.splice(idx, 1)
	}
}
function editorDetailsCbRegister(wid: number[], cb: ()=>void) {
	const obj = editorDetailsGetOrInsert(wid)
	obj.cbs.push(cb)
}
function editorDetailsCbUnregister(wid: number[], cb: ()=>void) {
	const obj = editorDetailsGet(wid)
	if (!obj) {
		return
	}
	const idx = obj.cbs.indexOf(cb)
	if (idx !== -1) {
		obj.cbs.splice(idx, 1)
	}
}



interface EditorProps {
	style?: CSSProperties,
	wid: number[],
	value: string,
	onChange: (val: string) => void,
}
function Editor(props: EditorProps) {
	const detailRef = useRef<EditorDetails|null>(null)
	const timeoutRef = useRef<number>(0)
	const tmpSelectionRef = useRef<EditorDetails|null>(null)
	const elementRef = useRef<HTMLDivElement>(null)
	const timeRef = useRef<number>(Date.now())
	const prevValue = useRef<string>('<<<<<<<<<')

	// only update when value from outside has changed and current html is different
	// this prevents race condition. When you deselect widget, setSelected() is called before onChange() and thus forces old value
	const tm2 = (props.value === prevValue.current || (elementRef.current && props.value === elementRef.current.innerHTML)) ? timeRef.current : Date.now()
	timeRef.current = tm2
	prevValue.current = props.value

	function saveCaret(c: EditorDetails, node: Node|null, off: number): void {
		const editor = getEditor(c.wid)
		c.node = (node && editor) ? getPidFromNode(node, editor) : []
		c.offset = off
		for (const cb of c.cbs) {
			cb()
		}
	}
	function selectionchange() {
		if (!detailRef.current) {
			return
		}
		const s = window.getSelection()
		const editor = getEditor(props.wid)
		if (s && s.anchorNode && editor && isNodeInside(s.anchorNode, editor)) {
			saveCaret(detailRef.current, s.anchorNode, s.anchorOffset)
		}
		else {
			saveCaret(detailRef.current, null, 0)
		}
	}
	const wid2 = props.wid.join(',')
	useEffect(() => {
		detailRef.current = editorDetailsGetOrInsert(props.wid)
		saveCaret(detailRef.current, null, 0)
		if (tmpSelectionRef.current && wid2 === tmpSelectionRef.current.wid.join(',')) {
			// reuse
			const editor = getEditor(props.wid)
			if (editor) {
				const el = getNodeFromPid(tmpSelectionRef.current.node, editor)
				if (el) {
					saveCaret(detailRef.current, el, tmpSelectionRef.current.offset)
					const range = document.createRange()
					range.setStart(el, tmpSelectionRef.current.offset)
					range.setEnd(el, tmpSelectionRef.current.offset)
					range.collapse(true)
					const s = window.getSelection()
					if (s) {
						s.removeAllRanges()
						s.addRange(range)
					}
				}
			}
		}
		tmpSelectionRef.current = null

		document.addEventListener('selectionchange', selectionchange)
		return () => {
			detailRef.current = null
			editorDetailsRemove(props.wid)
			document.removeEventListener('selectionchange', selectionchange)
		}
		// eslint-disable-next-line
	}, [wid2, timeRef.current])


	// wait 2sec and then update
	function change() {
		if (timeoutRef.current > 0) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = 0
		}
		function doUpdate() {
			timeoutRef.current = 0
			const editor = getEditor(props.wid)
			if (!editor) {
				return
			}
			// save selection
			const old = editorDetailsGet(props.wid)
			if (old) {
				tmpSelectionRef.current = {...old, cbs: []}
			}
			else {
				tmpSelectionRef.current = null
			}
			// change
			const val = editor.innerHTML
			props.onChange(val)
		}
		timeoutRef.current = window.setTimeout(doUpdate, 3000)
	}


	return <div
		ref={elementRef}
		style={props.style}
		draggable={true}
		onDragStart={e => {
			e.preventDefault()
			e.stopPropagation()
		}}
		dangerouslySetInnerHTML={{__html: props.value}}
		data-wid={props.wid.join(',')}
		
		contentEditable={true}
		onKeyDown={e => {
			e.stopPropagation()
			// when user presses enter, manually add new line to prevent adding new line inside button
			if (e.key === 'Enter') {
				const editor = getEditor(props.wid)
				const dt = editorDetailsGet(props.wid)
				if (!dt || !editor) {
					return
				}
				const node = getNodeFromPid(dt.node, editor)
				if (!node) {
					return
				}
				const btn = getButtonFromSelection(node, editor)
				if (!btn || !btn.parentElement) {
					return
				}
				// add new line after <button>
				e.preventDefault()
				const el = document.createElement('div')
				el.innerHTML = ''
				btn.parentElement.insertBefore(el, btn.nextSibling)
				// move caret
				const range = document.createRange()
				range.setStart(el, 0)
				range.setEnd(el, 0)
				range.collapse(true)
				const s = window.getSelection()
				if (s) {
					s.removeAllRanges()
					s.addRange(range)
				}
			}
		}}
		onInput={e => {
			e.stopPropagation()
			change()
		}}
		onBlur={e => {
			if (timeoutRef.current > 0) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = 0
			}
			const editor = getEditor(props.wid)
			if (!editor) {
				return
			}
			const val = editor.innerHTML
			props.onChange(val)
		}}
	/>
}



export interface TextHtmlData extends TData {
	type: 'TextHtml',
	value: string,
	font: TFont,
}



export interface TextHtmlCompiled extends TDataCompiled {
	type: 'TextHtml',
	value: string,
	font: TFont,
}


export const TextHtml: Widget = {
	name: {en: 'Text', sl: 'Besedilo'},
	icon: {fontawesome: faAlignLeft},

	newItem: async (): Promise<TextHtmlData> => {
		return {
			type: 'TextHtml',
			children: [],
			value: '',
			font: {},
		}
	},

	compile: async (dt: TextHtmlData, helper): Promise<TextHtmlCompiled> => {
		return {
			type: dt.type,
			children: [],
			value: await evaluateFormulaInsideHtml(dt.value, helper.formulaHelper),
			font: dt.font,
		}
	},

	Render: function(props) {
		const item = props.item as TextHtmlData
		const css = PropertyFontGenCss(item.font)
		css.minHeight = '20px'
		
		return <BoxName {...props} name={TextHtml.name}>
			<div
				onClick={e => {
					e.stopPropagation()
					const isSelected = JSON.stringify(props.selected) === JSON.stringify(props.wid)
						if (!isSelected) {
							props.setSelected(props.wid)
						}
				}}
			>
				<Editor
					wid={props.wid}
					value={item.value}
					onChange={val => props.setItem({...item, value: val})}
					style={css}
				/>
			</div>
		</BoxName>
	},

	RenderFinal: function(props) {
		const item = props.item as TextHtmlCompiled
		const css = PropertyFontGenCss(item.font)
		return <div
			style={css}
			dangerouslySetInnerHTML={{__html: item.value}}
		/>
	},

	RenderProperties: function(props) {
		const item = props.item as TextHtmlData
		const alignOpt: [string, string, IconDefinition, trKeys][] = [
			['left', 'justifyLeft', faAlignLeft, 'align-left'],
			['center', 'justifyCenter', faAlignCenter, 'align-center'],
			['right', 'justifyRight', faAlignRight, 'align-right'],
			['justify', 'justifyFull', faAlignJustify, 'align-justify'],
		]
		return <>
			<div className='d-flex'>
				<PropertyFont
					value={item.font}
					onChange={val => props.setItem({...props.item, font: val})}
					loadFonts={props.api.fonts}
				/>
				<button
					className='btn btn-sm btn-outline-danger ms-2'
					onClick={() => {
						const report = removeFromList(props.report, props.wid)
						props.setReport(report)
						props.setSelected(null)
					}}
				>
					<FontAwesomeIcon icon={faTrash} className='me-2' />
					{Trans('remove')}
				</button>
			</div>
			<hr />
			<div>
				<div className='btn-group'>
					{alignOpt.map(x => <button
						key={x[0]}
						className={`btn btn-outline-secondary`}
						onClick={() => document.execCommand(x[1])}
						title={Trans(x[3])}
					>
						<FontAwesomeIcon icon={x[2]} fixedWidth />
					</button>)}
				</div>
			</div>
			<div className='d-flex mt-2'>
				<div className="btn-group">
					<button
						className='btn btn-outline-secondary'
						onClick={() => document.execCommand('bold')}
						title={Trans('font-weight-bold')}
					>
						<FontAwesomeIcon icon={faBold} />
					</button>
					<button
						className='btn btn-outline-secondary'
						onClick={() => document.execCommand('italic')}
						title={Trans('font-style-italic')}
					>
						<FontAwesomeIcon icon={faItalic} />
					</button>
					<button
						className='btn btn-outline-secondary'
						onClick={() => document.execCommand('underline')}
						title={Trans('font-decoration-underline')}
					>
						<FontAwesomeIcon icon={faUnderline} />
					</button>
				</div>
				<button
					className='btn btn-outline-secondary ms-2'
					onClick={() => {
						const node = document.createElement('button')
						node.setAttribute('class', 'btn btn-outline-secondary')
						node.setAttribute('data-filter', '')
						node.innerText = 'data'
						node.style.padding = '0 0.2rem'

						const x = editorDetailsGet(props.wid)
						if (x) {
							const editor = getEditor(props.wid)
							if (!editor) {
								throw new Error('cant find editor')
							}
							let base: Node = editor
							for (const idx of x.node) {
								base = base.childNodes[idx]
							}
							const parent = base.parentNode
							if (parent) {
								if (base.nodeName === '#text') {
									const txtBefore = base.nodeValue?.substring(0, x.offset) || ''
									const txtAfter = (base.nodeValue?.substring(x.offset) || '') + '\u00a0'
									const nextSib = base.nextSibling
									if (parent) {
										base.nodeValue = txtBefore
										parent.insertBefore(node, nextSib)
										parent.insertBefore(document.createTextNode(txtAfter), nextSib)
										return
									}
								}
								// div
								// insert at front
								const nextSib = base.childNodes.length>0 ? base.childNodes[0] : null
								base.insertBefore(node, nextSib)
								base.insertBefore(document.createTextNode('\u00a0'), nextSib)
								return
							}
						}
						console.log('caret is null')
					}}
					title={Trans('tag insert')}
				>
					<FontAwesomeIcon icon={faTag} />
				</button>
			</div>

			<div className='mt-2'>
				<select
					className="form-select"
					value=''
					onChange={e => {
						const val = `${e.currentTarget.value}pt`
						const editor = getEditor(props.wid)
						if (val.length === 0 || !editor) {
							return
						}
						document.execCommand('fontSize', false, '7')
						var fontElements = document.getElementsByTagName('font')
						for (let i = 0, len = fontElements.length; i < len; ++i) {
							const el = fontElements[i]
							if (!isNodeInside(el, editor)) {
								continue
							}
							if (el.size === '7') {
								el.removeAttribute('size')
								el.style.fontSize = val
							}
						}
					}}
					title={Trans('font-size')}
					style={{maxWidth: '5rem'}}
				>
					<option value=''></option>
					{['8','10','12','14','16','18','24','36'].map(x => <option
							key={x}
							value={x}
						>
							{x}
						</option>
					)}
				</select>
			</div>

			<hr />
			<TagEditor {...props} />
		</>
	},

	canDrag: false,
}
