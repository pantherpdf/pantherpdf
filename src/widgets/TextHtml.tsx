/**
 * TextHtml.tsx
 */


// manual tests:
// - widget not selected, try to drag it. It should not be draggable, however it should select text
// - type some text, then wait few sec to periodicaly save, the cursor should stay on same place
// - insert tag, delete nbsp space after tag and press enter


import React, { useEffect, useState, CSSProperties } from 'react'
import { TData, TDataCompiled } from '../types'
import type { ItemRendeProps, Widget } from '../editor/types'
import BoxName from './BoxName'
import PropertyFont, { PropertyFontGenCss, TFont } from './PropertyFont'
import FormulaEvaluate from '../formula/formula'
import { faAlignCenter, faAlignJustify, faAlignLeft, faAlignRight, faBold, faItalic, faTag, faUnderline, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FormulaHelper } from '../editor/compile'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { listOfAdjusts } from './formulaAdjust'
import Trans, { TransName, trKeys } from '../translation'
import { idCmp } from '../editor/childrenMgmt'
import InputApplyOnEnter from './InputApplyOnEnter'
import style from './TextHtml.module.css'


const listOfEditors: Editor[] = []
const listOfSelectionCallbacks: (() => void)[] = []
const tagType = 'data'


function editorGet(wid: number[]): Editor | undefined {
	return listOfEditors.find(edt => idCmp(edt.props.wid, wid))
}

if (typeof window !== 'undefined' && window.document) {
	window.document.addEventListener('selectionchange', () => {
		const s = window.getSelection()
		const anchorNode = s ? s.anchorNode : null
		const anchorOffset = s ? s.anchorOffset : 0
		function getEditorByEditor(node: Node) {
			// keep function outside of loop
			// https://eslint.org/docs/rules/no-loop-func
			return listOfEditors.find(edt => edt.elementRef === node)
		}
		let editor: Editor | undefined = undefined
		let node = anchorNode
		while (node) {
			// check if editor
			editor = getEditorByEditor(node)
			if (editor) {
				break
			}
			// next parent
			node = node.parentNode
		}
		// reset all
		for (const edt of listOfEditors) {
			if (edt === editor) {
				edt.saveCaret(anchorNode, anchorOffset)
			}
		}
		// callbacks
		for (const cb of listOfSelectionCallbacks) {
			cb()
		}
	})
}



// return first parent tag
// node is usualy text
function getTagFromSelection(node: Node, editor: HTMLElement): HTMLElement | null {
	if (node === editor) {
		return null
	}
	if (node.nodeName.toLowerCase() === tagType.toLowerCase()) {
		return node as HTMLElement
	}
	if (node.parentNode) {
		return getTagFromSelection(node.parentNode, editor)
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


// Properties editor for tag
function getSelectedTagPid(wid: number[]): number[] | null {
	const x = editorGet(wid)
	if (!x || !x.elementRef) {
		return null
	}
	const selected = getNodeFromPid(x.selectedNode, x.elementRef)
	if (!selected) {
		return null
	}
	const btn = getTagFromSelection(selected, x.elementRef)
	if (!btn) {
		return null
	}
	return getPidFromNode(btn, x.elementRef)
}


function TagEditor(props: ItemRendeProps) {
	const [btnId, setBtnId] = useState<number[] | null>(null)

	// subscribe to selection change
	useEffect(() => {
		function selectionChanged() {
			setBtnId(getSelectedTagPid(props.wid))
		}
		selectionChanged()
		listOfSelectionCallbacks.push(selectionChanged)
		return () => {
			const idx = listOfSelectionCallbacks.indexOf(selectionChanged)
			if (idx !== -1) {
				listOfSelectionCallbacks.splice(idx, 1)
			}
		}
	}, [props.wid])

	// get <?>
	const editor = editorGet(props.wid)
	if (!btnId || !editor || !editor.elementRef) {
		return null
	}
	const btnTmp = getNodeFromPid(btnId, editor.elementRef)
	if (!btnTmp || btnTmp.nodeName.toLowerCase() !== tagType.toLowerCase()) {
		return null
	}
	const btn = btnTmp as HTMLElement

	const arrAdjusts = [...listOfAdjusts].sort((a,b) => a.category <= b.category ? -1 : 1)
	
	return <>
		<h3>Tag</h3>

		{/* FORMULA */}
		<div>
			<label htmlFor='tag-value'>
				{Trans('source data')}
			</label>
		</div>
		<div className="input-group mb-3">
			<span className="input-group-text fst-italic">ƒ</span>
			<InputApplyOnEnter
				id='tag-value'
				value={btn.innerText}
				onChange={val => {
					btn.innerText = String(val)
					editor.sendChanges(true)
				}}
			/>
		</div>

		{/* ADJUST */}
		<label htmlFor='tag-adjust' className='d-block'>
			{Trans('adjust')}
		</label>
		<select
			className='form-select'
			value={btn.getAttribute('data-adjust') || ''}
			onChange={e => {
				btn.setAttribute('data-adjust', e.currentTarget.value)
				editor.sendChanges(true)
			}}
			id='tag-adjust'
		>
			<option value=''></option>
			{arrAdjusts.map((flt, idx) => <React.Fragment key={flt.id}>
				{idx !== 0 && flt.category !== arrAdjusts[idx-1].category && <option disabled>──────────</option>}
				<option
					value={flt.id}
				>
					{flt.name ? TransName(flt.name) : flt.id}
				</option>
			</React.Fragment>)}
		</select>
	</>
}


// evaluate during compile
// replace <?> with value of formula inside <?>
export async function evaluateFormulaInsideHtml(html: string, formulaHelper: FormulaHelper, createDocument: (()=>Document)|undefined): Promise<string> {
	// parse html
	let parentEl: HTMLElement
	let doc2: Document
	if (createDocument) {
		doc2 = createDocument()
		parentEl = doc2.body
	}
	else {
		doc2 = window.document
		parentEl = doc2.createElement('div')
	}
	parentEl.innerHTML = html

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
		if (el.nodeName.toLowerCase() === tagType.toLowerCase()) {
			const btn = (el as HTMLElement)
			const formula = btn.textContent
			if (formula === null) {
				return doc2.createTextNode('')
			}
			if (typeof formula !== 'string') {
				return doc2.createTextNode('ERROR')
			}
			const value2 = await FormulaEvaluate(formula, formulaHelper)
			let value
			// adjust
			const adjustName = btn.getAttribute('data-adjust')
			if (adjustName) {
				const adjust = listOfAdjusts.find(x => x.id === adjustName)
				if (!adjust) {
					throw new Error(`Unknown adjust ${adjustName}`)
				}
				value = adjust.func(value2, [])
			}
			else {
				value = String(value2)
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


function insertTag(wid: number[]) {
	const editor = editorGet(wid)
	if (!editor || !editor.elementRef) {
		return
	}
	const selectedNode = getNodeFromPid(editor.selectedNode, editor.elementRef)
	if (!selectedNode || !selectedNode.parentNode) {
		return
	}
	const parentNode = selectedNode.parentNode

	// is inside tag?
	{
		let el: Node | null = selectedNode
		while (el) {
			if (el.nodeName.toLowerCase() === tagType.toLowerCase()) {
				return
			}
			el = el.parentNode
		}
	}

	const btn = document.createElement(tagType.toUpperCase())
	btn.setAttribute('data-adjust', '')
	const btnValue = 'data'
	const btnTextNode = document.createTextNode(btnValue)
	btn.appendChild(btnTextNode)
	
	if (selectedNode.nodeName === '#text') {
		const txtBefore = selectedNode.nodeValue?.substring(0, editor.selectedOffset) || ''
		const txtAfter = (selectedNode.nodeValue?.substring(editor.selectedOffset) || '') + '\u00a0'  // &nbsp;
		const nextSib = selectedNode.nextSibling
		selectedNode.nodeValue = txtBefore
		parentNode.insertBefore(btn, nextSib)
		parentNode.insertBefore(document.createTextNode(txtAfter), nextSib)
	}
	else if (selectedNode === editor.elementRef) {
		selectedNode.appendChild(btn)
		selectedNode.appendChild(document.createTextNode('\u00a0'))
	}
	else {
		const nextSib = selectedNode.nextSibling
		parentNode.insertBefore(btn, nextSib)
		parentNode.insertBefore(document.createTextNode('\u00a0'), nextSib)
	}

	// select
	const range = document.createRange()
	range.setStart(btnTextNode, 0)
	range.setEnd(btnTextNode, btnValue.length)
	range.collapse(true)
	const s = window.getSelection()
	if (s) {
		s.removeAllRanges()
		s.addRange(range)
	}
}









interface EditorProps {
	style?: CSSProperties,
	wid: number[],
	value: string,
	onChange: (val: string) => void,
	active: boolean,
}
interface EditorState {
}

// use class component instead of function - cleaner design
//  * no need to use useRef()
//  * access to shouldComponentUpdate()
class Editor extends React.Component<EditorProps, EditorState> {
	// reference to <div>
	elementRef: HTMLDivElement | null
	// to know when change is comming from here and when from outside
	currentValueFromProps: string
	// timeout for callback to save changes
	timerUpdate: number
	// selection - caret position
	selectedNode: number[]
	selectedOffset: number

	constructor(props: EditorProps) {
		super(props)
		this.state = { }

		this.elementRef = null
		this.currentValueFromProps = props.value
		this.timerUpdate = 0

		this.selectedNode = []
		this.selectedOffset = 0
	}

	componentDidMount() {
		listOfEditors.push(this)
	}

	componentWillUnmount() {
		if (this.timerUpdate) {
			this.sendChanges(true)
		}
		const idx = listOfEditors.indexOf(this)
		if (idx !== -1) {
			listOfEditors.splice(idx, 1)
		}
	}

	applyUpdates(el: HTMLDivElement, props: EditorProps, force: boolean) {
		// data-wid
		const widStr = props.wid.map(x => String(x)).join(',')
		el.setAttribute('data-wid', widStr)

		// style
		el.removeAttribute('style')
		if (props.style) {
			Object.assign(el.style, props.style)
		}
		// padding to separate content from outline (when it has focus), to show cursor
		el.style.padding = '1px 3px'

		// html
		if (props.value !== this.currentValueFromProps || force) {
			el.innerHTML = props.value
			this.currentValueFromProps = props.value
			this.saveCaret(null, 0)
		}
	}

	setElementRef(el: HTMLDivElement | null) {
		if (el === this.elementRef) {
			return
		}
		if (el) {
			// update <div>
			this.applyUpdates(el, this.props, true)
		}
		this.elementRef = el
	}

	shouldComponentUpdate(nextProps: EditorProps): boolean {
		if (this.elementRef) {
			this.applyUpdates(this.elementRef, nextProps, false)
		}
		// never re-render
		return false
	}

	saveCaret(node: Node|null, offset: number): void {
		const newNode = (node && this.elementRef) ? getPidFromNode(node, this.elementRef) : []
		// is same?
		if (this.selectedNode === newNode && this.selectedOffset === offset) {
			return
		}
		// update
		this.selectedNode = newNode
		this.selectedOffset = offset
		for (const cb of listOfSelectionCallbacks) {
			cb()
		}
	}

	editorInput(e: React.FormEvent<HTMLDivElement>) {
		e.stopPropagation()
		// set timer to update after few seconds
		if (this.timerUpdate > 0) {
			clearTimeout(this.timerUpdate)
			this.timerUpdate = 0
		}
		const tm = window.setTimeout(this.sendChanges.bind(this), 3000, false)
		this.timerUpdate = tm
	}

	sendChanges(cleanHtml: boolean) {
		// callback from timer
		if (this.timerUpdate) {
			clearTimeout(this.timerUpdate)
			this.timerUpdate = 0
		}
		if (!this.elementRef) {
			return
		}
		// change
		let val = this.elementRef.innerHTML
		if (val === this.currentValueFromProps) {
			return
		}
		if (cleanHtml) {
			// todo sanitize
			// todo remove empty tag
			// todo remove nbsp at end of line
			// todo remove tags like <span style="white-space: nowrap;">new real text</span>
			// todo remove style padding, margin, ...
			if (val === this.currentValueFromProps) {
				return
			}
		}
		this.currentValueFromProps = val
		this.props.onChange(val)
	}

	editorKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
		e.stopPropagation()
		// when user presses enter, manually add new line to prevent adding new line inside tag
		if (e.key !== 'Enter') {
			return
		}
		if (!this.elementRef) {
			return
		}
		const node = getNodeFromPid(this.selectedNode, this.elementRef)
		if (!node) {
			return
		}
		const btn = getTagFromSelection(node, this.elementRef)
		if (!btn || !btn.parentElement) {
			return
		}
		// add new line after <?>
		e.preventDefault()
		const el = document.createElement('div')
		const nodeTxt = document.createTextNode('\u00a0')
		el.appendChild(nodeTxt)
		btn.parentElement.insertBefore(el, btn.nextSibling)
		// move caret
		const range = document.createRange()
		range.setStart(nodeTxt, 0)
		range.setEnd(nodeTxt, 1)
		range.collapse(true)
		const s = window.getSelection()
		if (s) {
			s.removeAllRanges()
			s.addRange(range)
		}
	}

	// hack for safari
	// without removing draggable, text selection doesnt work
	// https://stackoverflow.com/questions/6399131/html5-draggable-and-contenteditable-not-working-together
	parentsRemoveDraggable(el: HTMLElement | null) {
		while (el) {
			if (el.draggable) {
				el.draggable = false
				el.setAttribute('data-draggable', '1')
			}
			el = el.parentElement
		}
	}

	parentsRestoreDraggable(el: HTMLElement | null) {
		while (el) {
			if (el.getAttribute('data-draggable') === '1') {
				el.draggable = true
				el.removeAttribute('data-draggable')
			}
			el = el.parentElement
		}
	}

	dropTag(e: React.DragEvent<HTMLDivElement>) {
		// https://developer.mozilla.org/en-US/docs/Web/API/Document/caretRangeFromPoint
		// https://jsfiddle.net/fpkjbech/
		e.preventDefault()
		const document_ = document as any
		const e_ = e as any
		let node: Node
		let offset: number
		e.currentTarget.focus()
		if (document_.caretRangeFromPoint) {
			const range = document.caretRangeFromPoint(e.clientX, e.clientY)
			if (!range) {
				return
			}
			node = range.startContainer
			offset = range.startOffset
		}
		else if (document_.caretPositionFromPoint) {
			const range = document_.caretPositionFromPoint(e.clientX, e.clientY)
			if (!range) {
				return
			}
			node = range.offsetNode
			offset = range.offset
		}
		else if (e_.rangeParent) {
			const range = document.createRange()
			range.setStart(e_.rangeParent, e_.rangeOffset)
			node = range.startContainer
			offset = range.startOffset
		}
		else {
			// not supported
			return
		}
		// update selection
		if (!node || !this.elementRef) {
			return
		}
		this.selectedNode = getPidFromNode(node, this.elementRef)
		this.selectedOffset = offset
		for (const cb of listOfSelectionCallbacks) {
			cb()
		}
		// editor
		const widStr = e.currentTarget.getAttribute('data-wid')
		if (!widStr || widStr.length === 0) {
			return
		}
		const wid = widStr.split(',').map(x => parseInt(x))
		// insert
		insertTag(wid)
	}

	render() {
		return <div
			ref={this.setElementRef.bind(this)}
			contentEditable={true}
			draggable={true}
			onDragStart={e => {
				e.preventDefault()
				e.stopPropagation()
			}}
			onKeyDown={this.editorKeyDown.bind(this)}
			onInput={this.editorInput.bind(this)}
			onFocus={(e) => {
				this.parentsRemoveDraggable(e.currentTarget)
			}}
			onBlur={(e) => {
				this.parentsRestoreDraggable(e.currentTarget)
				this.sendChanges(true)
			}}
			className={style.editor}
			onDrop={(e) => {
				const dt = e.dataTransfer.getData('text/plain')
				if (dt === 'insert-tag') {
					this.dropTag(e)
				}
			}}
		/>
	}
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


function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}


export const TextHtml: Widget = {
	name: {en: 'Text', sl: 'Besedilo'},
	icon: {fontawesome: faAlignLeft},

	newItem: async (props): Promise<TextHtmlData> => {
		const value = props.report.children.length > 0 ? '' : `<div>${escapeHtml(Trans('TextHtml initial value'))}</div>`
		return {
			type: 'TextHtml',
			children: [],
			value,
			font: {},
		}
	},

	compile: async (dt: TextHtmlData, helper): Promise<TextHtmlCompiled> => {
		return {
			type: dt.type,
			value: await evaluateFormulaInsideHtml(dt.value, helper.formulaHelper, helper.externalHelpers.createDocument),
			font: dt.font,
		}
	},

	Render: function(props) {
		const item = props.item as TextHtmlData
		const css = PropertyFontGenCss(item.font)
		css.minHeight = '20px'
		
		return <BoxName
			{...props}
			name={TextHtml.name}
			visible={!props.selected || !idCmp(props.selected, props.wid)}
		>
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
					active={!!props.selected && idCmp(props.wid, props.selected)}
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
			<div className='hform'>
				<label>
					{Trans('font')}
				</label>
				<PropertyFont
					value={item.font}
					onChange={val => props.setItem({...props.item, font: val})}
					loadFonts={props.api.fonts}
				/>
			</div>
			<hr />
			<div className='mb-2'>
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
			<div className='d-flex mb-3'>
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
					title={Trans('tag insert')}
					draggable='true'
					onDragStart={(e) => {
						e.dataTransfer.setData('text/plain', 'insert-tag')
					}}
					onClick={() => insertTag(props.wid)}
				>
					<FontAwesomeIcon icon={faTag} />
				</button>
			</div>

			<div className='hform'>
				<label htmlFor='TextHtml-fontSize'>
					{Trans('font-size')}
				</label>
				<select
					className='form-select'
					id='TextHtml-fontSize'
					value=''
					onChange={e => {
						const val = `${e.currentTarget.value}pt`
						const editor = editorGet(props.wid)
						if (val.length === 0 || !editor || !editor.elementRef) {
							return
						}
						document.execCommand('fontSize', false, '7')
						var fontElements = document.getElementsByTagName('font')
						for (let i = 0, len = fontElements.length; i < len; ++i) {
							const el = fontElements[i]
							if (!isNodeInside(el, editor.elementRef)) {
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
					</option>)}
				</select>
			</div>

			<hr />
			<TagEditor {...props} />
		</>
	},

	canDrag: false,
}
