import React, { useState, useEffect } from 'react'


async function load(apiKey: string) {
	const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${encodeURIComponent(apiKey)}&sort=popularity`
	const r = await fetch(url)
	if (!r.ok) {
		throw new Error('Error fetching fonts')
	}
	const js = await r.json() as GoogleFontsApiResponse
	return js.items
}

interface GoogleFontsApiEntry {
	kind: string,
	family: string,
	subsets: string[],
	variants: string[],
	version: string,
	lastModified: string,
	files: {[key: string]: string},
}
interface GoogleFontsApiResponse {
	kind: string,
	items: GoogleFontsApiEntry[],
}
interface FontSelectorProps {
	apiKey: string,
	value: string,
	onChange: (selected: string) => void,
}

let cache: GoogleFontsApiEntry[] | undefined = undefined
export function GoogleFontSelector(props: FontSelectorProps) {
	const [list, setList] = useState<GoogleFontsApiEntry[]>(cache || [])
	useEffect(() => {
		if (cache) {
			return
		}
		load(props.apiKey).then(list2 => {
			cache = list2
			setList(cache)
		})
	}, [props.apiKey])
	
	const selected = props.value.toLowerCase()
	return <div>
		{list.map(e => <div
			key={e.family}
		>
			<div className='list-group list-group-flush'>
				<button
					onClick={() => props.onChange(e.family)}
					className={'list-group-item list-group-item-action '+(e.family.toLowerCase()===selected?'active':'')}
				>
					{e.family}
				</button>
			</div>
		</div>)}
	</div>
}


export function GoogleFontCssUrl(fontFamily: string): string | undefined {
	const f2 = fontFamily.toLowerCase().trim()
	const systemFonts = [
		'',
		'arial',
		'verdana',
		'helvetica',
		'trebuchet ms',
		'times new roman',
		'helvetica',
		'calibri',
		'cambria',
		'comic sans ms',
	]
	if (systemFonts.indexOf(f2) !== -1) {
		return undefined
	}
	return `https://fonts.googleapis.com/css?family=${encodeURIComponent(fontFamily.trim())}`
}


const didLoad: string[] = []
export function LoadGoogleFontCss(fontFamily: string): void {
	if (didLoad.indexOf(fontFamily) !== -1) {
		return
	}
	didLoad.push(fontFamily)
	if (typeof global.window === 'undefined') {
		throw new Error('LoadGoogleFontCss() is only available on browser.')
	}
	const url = GoogleFontCssUrl(fontFamily)
	if (!url) {
		return
	}
	const link = global.document.createElement('link')
	link.rel = 'stylesheet'
	link.href = url
	global.document.head.appendChild(link)
}
