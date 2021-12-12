import { namedChars } from './HtmlNamedChars'


export function encodeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}


function decodeHtmlChar(name: string) {
	// hex
	if (name.startsWith('#x')) {
		const name2 = name.substring(2).toLowerCase()
		const x = parseInt(name2, 16)
		if (!isFinite(x) || name2 !== x.toString(16)) {
			throw new Error('bad code point')
		}
		return String.fromCodePoint(x)
	}

	// decimal
	if (name.startsWith('#')) {
		const name2 = name.substring(1)
		const x = parseInt(name2)
		if (!isFinite(x) || name2 !== String(x)) {
			throw new Error('bad code point')
		}
		return String.fromCodePoint(x)
	}

	// named
	const val = namedChars[name]
	if (!val) {
		throw new Error('Unknown named character')
	}
	return String.fromCodePoint(...val)
}


function decodeHtmlInternal(html: string, i: number, end: number): string {
	// €
	// &#x20AC;
	// &#8364;
	// &euro;
	
	let out = ''
	while (i < end) {
		const idx = html.indexOf('&', i)
		if (idx === -1 || idx >= end) {
			break
		}
		if (idx !== i) {
			out += html.substring(i, idx)
		}
		i = idx + 1
		const idx2 = html.indexOf(';', i)
		if (idx === -1 || idx >= end) {
			throw new Error('missing ;')
		}
		let value = html.substring(i, idx2)
		value = decodeHtmlChar(value)
		out += value
		i = idx2 + 1
	}
	if (i < end) {
		out += html.substring(i, end)
	}
	return out
}


export function decodeHtml(html: string): string {
	return decodeHtmlInternal(html, 0, html.length)
}


export type Element_ = {
	name: string,
	attributes: {[key: string]: string | undefined},
	textContent: string,
	children: Element_[],
}


// https://www.w3.org/TR/2011/WD-html-markup-20110113/syntax.html
const voidEelements = [
	'area',
	'base',
	'br',
	'col',
	'command',
	'embed',
	'hr',
	'img',
	'input',
	'keygen',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr',
]


// https://www.w3.org/TR/2011/WD-html5-20110525/common-microsyntaxes.html#space-character
const whiteSpaceChars = [
	'\n',
	' ',
	'\t',
	'\r',
	'\f',
]


function emptyElement(name: string = ''): Element_ {
	return {
		name,
		attributes: {},
		textContent: '',
		children: [],
	}
}


function parseAttrsKey(html: string, i: number): [string, number] {
	const iStart = i
	while (i < html.length) {
		if (whiteSpaceChars.indexOf(html[i]) !== -1 || html[i] === '=' || html[i] === '/' || html[i] === '>') {
			break
		}
		i += 1
	}
	return [html.substring(iStart, i), i]
}


function parseAttrsValue(html: string, i: number): [string, number] {
	if (i >= html.length) {
		throw new Error('bad value')
	}
	const quote = html[i]
	i += 1
	if (quote !== '"' && quote !== "'") {
		throw new Error('Bad quote')
	}

	const idx = html.indexOf(quote, i)
	if (idx === -1) {
		throw new Error('cant find closing quote')
	}
	const value = decodeHtmlInternal(html, i, idx)
	return [value, idx+1]
}


function parseAttrs(html: string, i: number): [{[key: string]: string | undefined}, number] {
	const args: {[key: string]: string | undefined} = {}
	while (i < html.length) {
		if (whiteSpaceChars.indexOf(html[i]) !== -1) {
			i += 1
			continue
		}
		if (html[i] === '/' || html[i] === '>') {
			break
		}
		const [key, i2] = parseAttrsKey(html, i)
		i = i2
		args[key] = undefined
		if (i < html.length && html[i] === '=') {
			i += 1
			const [value, i3] = parseAttrsValue(html, i)
			i = i3
			args[key] = value
		}
	}
	return [args, i]
}


function parseElement(html: string, i: number): [Element_, number] {
	const el: Element_ = emptyElement()
	if (html[i] !== '<') {
		throw new Error('Missing start tag')
	}
	i += 1

	// comment
	if (html.substring(i, i+3) === '!--') {
		const idx = html.indexOf('-->', i+3)
		if (idx === -1) {
			throw new Error('Missing end of comment')
		}
		el.name = '#comment'
		el.textContent = html.substring(i+3, idx)
		return [el, idx+3]
	}

	// name
	while (i < html.length && html[i] !== '/' && html[i] !== '<' && html[i] !== '>' && whiteSpaceChars.indexOf(html[i]) === -1) {
		el.name += html[i]
		i += 1
	}
	el.name = el.name.toLowerCase()
	if (el.name === 'script' || el.name === 'style') {
		// could write special parser
		// raw text    <->    html
		// var a = '</script>';    <->    var a = '<\/script>';
		throw new Error('script and style not supported')
	}

	// attributes
	const [attrs, iEnd] = parseAttrs(html, i)
	i = iEnd
	el.attributes = attrs

	// self closing
	if (i+2 <= html.length && html[i] === '/' && html[i+1] === '>') {
		return [el, i+2]
	}

	// should end with >
	if (i >= html.length || html[i] !== '>') {
		throw new Error('bad element')
	}
	i += 1

	// void elements without content
	if (voidEelements.indexOf(el.name) !== -1) {
		return [el, i]
	}

	// children
	const [chs, i2] = parseChildren(html, i)
	el.children = chs
	i = i2

	// closing tag
	if (!(
		i+2+el.name.length+1 <= html.length &&
		html[i+0] === '<' &&
		html[i+1] === '/' &&
		html[i+2+el.name.length] === '>' &&
		html.substring(i+2, i+2+el.name.length).toLowerCase() === el.name
	)) {
		throw new Error('Missing closing tag')
	}
	return [el, i+2+el.name.length+1]
}


function parseChildren(html: string, i: number): [Element_[], number] {
	const arr: Element_[] = []
	while (i < html.length) {
		if (i+2 <= html.length && html[i] === '<' && html[i+1] === '/') {
			return [arr, i]
		}
		if (html[i] === '<') {
			const [el, i2] = parseElement(html, i)
			i = i2
			arr.push(el)
		}
		else {
			if (arr.length === 0 || arr[arr.length - 1].name !== '#text') {
				const el = emptyElement('#text')
				el.textContent = ''
				arr.push(el)
			}
			arr[arr.length-1].textContent += html[i]
			i += 1
		}
	}
	for (const el of arr) {
		if (el.name === '#text') {
			el.textContent = decodeHtml(el.textContent)
		}
	}
	return [arr, html.length]
}


export function parse(html: string): Element_[] {
	const [arr, i2] = parseChildren(html, 0)
	if (i2 !== html.length) {
		throw new Error('Didnt parse everything')
	}
	return arr
}


// https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
const inlineElements = [
	'a',
	'abbr',
	'acronym',
	'audio',
	'b',
	'bdi',
	'bdo',
	'big',
	'br',
	'button',
	'canvas',
	'cite',
	'code',
	'data',
	'datalist',
	'del',
	'dfn',
	'em',
	'embed',
	'i',
	'iframe',
	'img',
	'input',
	'ins',
	'kbd',
	'label',
	'map',
	'mark',
	'meter',
	'noscript',
	'object',
	'output',
	'picture',
	'progress',
	'q',
	'ruby',
	's',
	'samp',
	'script',
	'select',
	'slot',
	'small',
	'span',
	'strong',
	'sub',
	'sup',
	'svg',
	'template',
	'textarea',
	'time',
	'u',
	'tt',
	'var',
	'video',
	'wbr',
]


function extractTextInternal(el: Element_): string {
	if (el.name === '#text') {
		// custom whitespace remover
		// should not use .replace() with regex because it also removes nbsp
		let txt = ''
		for (let i = 0; i < el.textContent.length; ++i) {
			const ch = el.textContent[i]
			if (whiteSpaceChars.indexOf(ch) === -1) {
				txt += ch
			}
			else if (txt.length === 0 || txt[txt.length-1] !== ' ') {
				txt += ' '
			}
		}
		return txt
	}
	const lines: string[] = ['']
	for (const el2 of el.children) {
		if (el2.name === 'br') {
			//lines[lines.length - 1] += '\n'
			lines.push('')
			continue
		}
		let txt2 = extractTextInternal(el2)
		if (el2.name.startsWith('#') || inlineElements.indexOf(el2.name) !== -1) {
			// inline
			lines[lines.length-1] += txt2
		}
		else {
			// block
			if (lines[lines.length - 1].length === 0) {
				lines[lines.length - 1] = txt2
			}
			else {
				lines.push(txt2)
			}
			lines.push('')
		}
	}
	if (lines[lines.length - 1].length === 0) {
		lines.splice(lines.length - 1, 1)
	}
	return lines.join('\n')
}


export function extractText(el: Element_): string {
	const txt = extractTextInternal(el)

	// find first non space
	// similar to trim() but trim() also removes nbsp
	let start = 0
	while (start < txt.length && whiteSpaceChars.indexOf(txt[start]) !== -1) {
		start += 1
	}
	let end = txt.length
	while (end > start && whiteSpaceChars.indexOf(txt[end-1]) !== -1) {
		end -= 1
	}

	let txt2 = ''
	for (let i = start; i < end; ++i) {
		if (txt[i] === ' ') {
			if (txt2[txt2.length-1] !== ' ') {
				txt2 += ' '
			}
		}
		else {
			txt2 += txt[i]
		}
	}
	return txt2
}
