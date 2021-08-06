/**
 * TextHtml.tsx
 */


import React, { CSSProperties } from 'react'
import { TData, TDataCompiled } from '../types'
import type { Widget } from '../editor/types'
import BoxName from './BoxName'
import PropertyFont, { PropertyFontGenCss, TFont } from './PropertyFont'
import FormulaEvaluate from '../formula/formula'
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons'
import PropertyAlign, { TAlign } from './PropertyAlign'
import { FormulaHelper } from '../editor/compile'


export async function evaluateFormulaInsideHtml(html: string, formulaHelper: FormulaHelper): Promise<string> {
	// parse html
	// on browser use createElement()
	// on nodejs use JSDOM library
	let parentEl: HTMLElement
	if (typeof window === 'undefined') {
		const JSDOM__ = await import('jsdom');
		const JSDOM_ = JSDOM__.JSDOM
		const dom = new JSDOM_(html)
		parentEl = dom.window.document.body
	}
	else {
		parentEl = document.createElement('div')
	}

	interface THtmlVar { varValue: string }
	interface THtml { type: string, attr: string, childs: (string | THtmlVar | THtml)[] }
	let isVar: null | THtmlVar = null
	
	function process(el: HTMLElement, elOut: THtml) {
		for (let i=0; i<el.childNodes.length; ++i) {
			const el2 = el.childNodes[i]
			if (el2.nodeName === '#text') {
				const txt = el2.textContent || ''

				let start = 0
				if (!isVar) {
					const start2 = txt.indexOf('{', start)
					if (start2 !== -1) {
						if (start2 !== start) {
							const txt2 = txt.substring(start, start2)
							elOut.childs.push(txt2)
						}
						start = start2 + 1
						const v2: THtmlVar = { varValue: '' }
						elOut.childs.push(v2)
						isVar = v2
					}
				}
				if (isVar) {
					const start2 = txt.indexOf('}', start)
					if (start2 !== -1) {
						if (start2 !== start) {
							const txt2 = txt.substring(start, start2)
							isVar.varValue += txt2
						}
						start = start2 + 1
						isVar = null
					}
					else {
						isVar.varValue += txt.substring(start)
						start = txt.length
					}
				}
				if (start < txt.length) {
					const txt2 = txt.substring(start)
					elOut.childs.push(txt2)
				}
			}
			else if (el2.nodeName.startsWith('#')) {
				// ignore
			}
			else {
				const el4 = el2 as HTMLElement
				function atts(arr: NamedNodeMap) {
					let txt = ''
					for (let i=0; i<arr.length; ++i) {
						txt += ` ${arr[i].name}="${arr[i].value.replace('"', '&quot;')}"`
					}
					return txt
				}
				const el3: THtml = {
					type: el2.nodeName.toLowerCase(),
					attr: atts(el4.attributes),
					childs:[],
				}
				elOut.childs.push(el3)
				process(el4, el3)
			}
		}
	}
	
	const out: THtml = { type: 'body', attr: '', childs:[] }
	process(parentEl, out)

	const noCloseTag = (t: string) => t==='br' || t==='hr'
	async function toStr(el: THtml): Promise<string> {
		let txt = `<${el.type}${el.attr}>`
		if (noCloseTag(el.type) && el.childs.length === 0)
			return txt
		for (const ch of el.childs) {
			if (typeof ch === 'string') {
				txt += ch
			}
			else if ('varValue' in ch) {
				const result = await FormulaEvaluate(ch.varValue, formulaHelper)
				txt += String(result)
			}
			else {
				txt += await toStr(ch)
			}
		}
		txt += `</${el.type}>`
		return txt
	}
	const html2 = await toStr(out)
	const html3 = html2.substring(6, html2.length-7)

	return html3
}



export interface TextHtmlData extends TData {
	type: 'TextHtml',
	value: string,
	font: TFont,
	align?: TAlign,
}



export interface TextHtmlCompiled extends TDataCompiled {
	type: 'TextHtml',
	value: string,
	font: TFont,
	align?: TAlign,
}



interface EditorProps {
	value: string,
	onChange: (value: string) => void,
	chStyle: CSSProperties,
}

function Editor(props: EditorProps) {
	// todo make better styling
	// todo strip unsafe tags
	// todo strip unsafe tags in backend

	function ch(e: React.FormEvent<HTMLParagraphElement>) {
		//
	}

	function bl(e: React.FocusEvent<HTMLParagraphElement>) {
		props.onChange(e.currentTarget.innerHTML)
	}

	return <div>
		<div style={{outline: '1px solid #ccc'}}>
			<div
				contentEditable={true}
				onInput={ch}
				onBlur={bl}
				dangerouslySetInnerHTML={{__html: props.value}}
				style={props.chStyle}
			/>
		</div>
		<button onClick={() => document.execCommand('bold')}>Bold</button>
		<button onClick={() => document.execCommand('italic')}>italic</button>
	</div>
}



export const TextHtml: Widget = {
	name: {en: 'Text Html'},
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
			align: dt.align,
		}
	},

	Render: function(props) {
		const item = props.item as TextHtmlData
		const css = PropertyFontGenCss(item.font)
		if (item.align) {
			css.textAlign = item.align
		}
		css.minHeight = '20px'
		return <BoxName name={TextHtml.name}>
			<div
				style={css}
				dangerouslySetInnerHTML={{__html: item.value}}
			/>
		</BoxName>
	},

	RenderFinal: function(props) {
		const item = props.item as TextHtmlCompiled
		const css = PropertyFontGenCss(item.font)
		if (item.align) {
			css.textAlign = item.align
		}
		return <div
			style={css}
		>
			{item.value}
		</div>
	},

	RenderProperties: function(props) {
		const item = props.item as TextHtmlData
		const css1 = PropertyFontGenCss(props.report.properties.font || {})
		const css2 = PropertyFontGenCss(item.font)
		const css = {...css1, ...css2}
		if (item.align) {
			css.textAlign = item.align
		}
		return <>
			<PropertyAlign
				value={item.align}
				onChange={val => props.setItem({...props.item, align: val})}
			/>
			<PropertyFont
				value={item.font}
				onChange={val => props.setItem({...props.item, font: val})}
			/>
			<div>
				<small>
					Use variable like this:
					Hello <span className='font-monospace'>{'{data.name}'}</span>!
				</small>
			</div>
			<Editor
				value={item.value}
				onChange={val => props.setItem({...props.item, value: val})}
				chStyle={css}
			/>
		</>
	},
}
