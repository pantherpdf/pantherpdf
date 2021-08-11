type trKeys =
	'report' | 'reports' |
	'font-weight-normal' | 'font-weight-bold' | 'font-style-normal' | 'font-style-italic' | 'font' | 'font-family' | 'font-size' | 'font-style' | 'font-weight' |
	'color' | 'enable' | 'empty' |
	'upload bad file' | 'upload finished' | 'download' | 'upload' | 'widgets' | 'predefined' | 'file' |
	'invalid value' |
	'name' | 'show more' | 'show less' | 'target' | 'fileName' | 'paperWidth' | 'paperHeight' | '0 means default' | 'margin' | 'lang' | 'lang 2 letter code' | 'users lang' | 'new name' | 'delete report' | 'delete report question' |
	'no widgets available for target' |
	'source data' | 'insert data transform' | 'up' | 'down' | 'delete' | 'edit' | 'comment' | 'save' | 'cancel' | 'data' | 'field' | 'condition' |
	''

export type TTrans = {en: string}

const tr2: {[key in trKeys]: TTrans} = {
	'': { en: '' },
	'report': { en:'Report' },
	'reports': { en:'Reports' },

	'font-weight-normal': { en:'Normal' },
	'font-weight-bold': { en:'Bold' },
	'font-style-normal': { en:'Normal' },
	'font-style-italic': { en:'Italic' },
	'font': { en:'Font' },
	'font-family': { en:'Family' },
	'font-size': { en:'Size' },
	'font-style': { en:'Style' },
	'font-weight': { en:'Weight' },

	'color': { en:'Color' },
	'enable': { en:'Enable' },
	'empty': { en:'Empty' },

	'upload bad file': { en:'Upload bad file' },
	'upload finished': { en:'Upload finished' },
	'download': { en:'Download' },
	'upload': { en:'Upload' },
	'widgets': { en:'Widgets' },
	'predefined': { en:'Predefined' },
	'file': { en:'File' },

	'invalid value': { en:'invalid value'},

	'name': { en:'Name' },
	'show more': { en:'Show more' },
	'show less': { en:'Show less' },
	'target': { en:'Target' },
	'fileName': { en:'File Name' },
	'paperWidth': { en:'Paper Width' },
	'paperHeight': { en:'Paper Height' },
	'0 means default': { en:'0 means default' },
	'margin': { en:'Margin' },
	'lang': { en:'Language' },
	'lang 2 letter code': { en:'2 letter code' },
	'users lang': { en:'User Language' },
	'new name': { en:'New name' },
	'delete report': { en: 'Delete report' },
	'delete report question': { en: 'Are you sure to delete this report?' },
	'no widgets available for target': { en: 'No widgets available for target {0}.' },
	
	'source data': { en: 'Source data' },
	'insert data transform': { en: 'Insert data transform' },
	'up': { en:'Up' },
	'down': { en:'Down' },
	'delete': { en:'Delete' },
	'edit': { en:'Edit' },
	'comment': { en:'Comment' },
	'save': { en:'Save' },
	'cancel': { en:'Cancel' },
	'data': { en:'Data' },
	'field': { en:'Field' },
	'condition': { en:'Condition' },
}

export function TransName(name: string|{[key:string]:string}, lang?: string): string {
	if (typeof name == 'string')
		return name
	if (lang && lang in name)
		return name[lang]
	if ('en' in name)
		return name.en
	const keys = Object.keys(name)
	if (keys.length > 0)
		return name[keys[0]]
	return ''
}

export default function Trans(key: trKeys, params?: any[]): string {
	let n = TransName(tr2[key])
	const regex = /{(\d+)}/gm;
	const pl = params ? params.length : 0
	n = n.replace(regex, (match, p0, p1) => {
		const idx = parseInt(p0)
		if (idx >= 0 && idx < pl)
			return params?.[idx]
		return undefined
	})
	return n
}
