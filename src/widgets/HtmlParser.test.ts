import { parse, extractText, decodeHtml, encodeHtml, Element_ } from './HtmlParser'


test('attributes', () => {
	const x = parse('<div a="123" b c=\'aaa\'></div>')
	expect(x[0].attributes.a).toBe('123')
	expect(x[0].attributes.b).toBe(undefined)
	expect(x[0].attributes.c).toBe('aaa')
})


test('self-closing', () => {
	let x: Element_[]
	
	x = parse('<IMG><img>')
	expect(x.length).toBe(2)
	expect(x[0].name).toBe('img')
	expect(x[1].name).toBe('img')

	expect(() => parse('<IMG></img>')).toThrow()

	x = parse('<IMG/><img/>')
	expect(x.length).toBe(2)
	expect(x[0].name).toBe('img')
	expect(x[1].name).toBe('img')
})


test('should parse text', () => {
	const r = parse('<DIV>abc<br>def</DIV>')
	expect(r.length).toBe(1)
	expect(r[0].name).toBe('div')
	expect(r[0].children.length).toBe(3)
	expect(r[0].children[0].name).toBe('#text')
	expect(r[0].children[0].textContent).toBe('abc')
	expect(r[0].children[1].name).toBe('br')
	expect(r[0].children[2].name).toBe('#text')
	expect(r[0].children[2].textContent).toBe('def')
})


test('should throw when bad closing tag', () => {
	expect(() => parse('<div>abc</span>')).toThrow()
})


test('extract text', () => {
	const el = parse('<div>123<div><div>abc</div></div>456\n789<span>0<br>1</span></div>')
	expect(extractText(el[0])).toBe('123\nabc\n456 7890\n1')
})


test('extract text br and div', () => {
	const el = parse('<div>123<br><div>456</div></div>')
	expect(extractText(el[0])).toBe('123\n456')
})


test('extract text br and div 2', () => {
	const el = parse('<div>abc<div><br></div>123</div>')
	expect(extractText(el[0])).toBe('abc\n\n123')
})


test('extract text nbsp', () => {
	const el = parse('&nbsp;&nbsp;&nbsp;')
	expect(extractText(el[0])).toBe('\u00A0\u00A0\u00A0')
})


test('extract text multiple blocks', () => {
	const el = parse('<div><div><div><div><div>abc</div></div></div></div>2</div>')
	expect(extractText(el[0])).toBe('abc\n2')
})


test('extract text comments', () => {
	const el = parse('<div> abc<!-- def -->2</div>')
	expect(extractText(el[0])).toBe('abc2')
})


test('decode html', () => {
	expect(decodeHtml('&#x20AC; &#8364; &euro;')).toBe('€ € €')
})


test('encode html', () => {
	expect(encodeHtml('abc < def > " 123 \' 456 &amp;')).toBe('abc &lt; def &gt; &quot; 123 &#039; 456 &amp;amp;')
})
