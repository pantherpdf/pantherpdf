// cannot enforce type
// otherwise its not object literal anymore and key type would be lost (it would be generic string)
const tr2 = {
	'': { en: '', sl:'' },
	'report': { en:'Report', sl:'Poročilo' },
	'reports': { en:'Reports', sl:'Poročila' },

	'font-weight-normal': { en:'Normal', sl:'Navadno' },
	'font-weight-bold': { en:'Bold', sl:'Krepko' },
	'font-style-normal': { en:'Normal', sl:'Navadno' },
	'font-style-italic': { en:'Italic', sl:'Ležeče' },
	'font-decoration-underline': { en:'Underline', sl:'Podčrtaj' },
	'font': { en:'Font', sl:'Pisava' },
	'font-family': { en:'Family', sl:'Vrsta' },
	'font-size': { en:'Size', sl:'Velikost' },
	'font-style': { en:'Style', sl:'Stil' },
	'font-weight': { en:'Weight', sl:'Debelina' },
	'border-style': { en:'Style', sl:'Stil' },
	'border-solid': { en:'Solid', sl:'Polna' },
	'border-dashed': { en:'Dashed', sl:'Črtkano' },
	'border-dotted': { en:'Dotted', sl:'Pike' },

	'align-left': { en:'Align Left', sl:'Poravnaj Levo' },
	'align-center': { en:'Align Center', sl:'Poravnaj na Sredino' },
	'align-right': { en:'Align Right', sl:'Poravnaj Desno' },
	'align-justify': { en:'Justify', sl:'Razporedi' },

	'color': { en:'Color', sl:'Barva' },
	'enable': { en:'Enable', sl:'Omogoči' },
	'empty': { en:'Empty', sl:'Prazno' },

	'upload bad file': { en:'Uploaded bad file', sl:'Naložena datoteka ni primerna' },
	'upload finished': { en:'Upload finished', sl:'Nalaganje končano' },
	'download': { en:'Download', sl:'Prenesi' },
	'upload': { en:'Upload', sl:'Naloži' },
	'widgets': { en:'Widgets', sl:'Gradniki' },
	'predefined': { en:'Predefined', sl:'Predefinirano' },
	'file': { en:'File', sl:'Datoteka' },

	'invalid value': { en:'invalid value', sl:'Neveljavna vrednost' },

	'name': { en:'Name', sl:'Ime' },
	'show more': { en:'Show more', sl:'Pokaži več' },
	'show less': { en:'Show less', sl:'Pokaži manj' },
	'target': { en:'Target', sl:'Cilj' },
	'fileName': { en:'File Name', sl:'Ime datoteke' },
	'paperWidth': { en:'Paper Width', sl:'Papir širina' },
	'paperHeight': { en:'Paper Height', sl:'Papir višina' },
	'0 means default': { en:'0 means default', sl:'0 pomeni standardno' },
	'margin': { en:'Margin', sl:'Odmik zunaj' },
	'margin top': { en:'Margin Top', sl:'Odmik Zgoraj' },
	'margin bottom': { en:'Margin Bottom', sl:'Odmik Spodaj' },
	'padding': { en:'Padding', sl:'Odmik noter' },
	'lang': { en:'Language', sl:'Jezik' },
	'lang 2 letter code': { en:'2 letter code', sl:'koda 2 črke' },
	'users lang': { en:'User Language', sl:'Uporabnikov jezik' },
	'new name': { en:'New name', sl:'Novo ime' },
	'delete report': { en: 'Delete report', sl:'Izbriši poročilo' },
	'delete report question': { en: 'Are you sure to delete this report?', sl:'Ali si prepričan da želiš izbrisati to poročilo?' },
	'no widgets available for target -name-': { en: 'No widgets available for target {0}.', sl:'Gradniki niso na voljo za cilj {0}' },
	
	'source data': { en: 'Source data', sl:'Izvorni podatki' },
	'transform': { en: 'Transform', sl: 'Transformacija' },
	'insert data transform': { en: 'Insert data transform', sl:'Vstavi transformacijo' },
	'up': { en:'Up', sl:'Gor' },
	'down': { en:'Down', sl:'Dol' },
	'delete': { en:'Delete', sl:'Izbriši' },
	'remove': { en:'Remove', sl:'Odstrani' },
	'edit': { en:'Edit', sl:'Uredi' },
	'comment': { en:'Comment', sl:'Komentar' },
	'save': { en:'Save', sl:'Shrani' },
	'cancel': { en:'Cancel', sl:'Prekliči' },
	'data': { en:'Data', sl:'Podatki' },
	'field': { en:'Field', sl:'Polje' },
	'condition': { en:'Condition', sl:'Pogoj' },

	'replace': { en: 'Replace', sl: 'Zamenjaj' },
	'reset': { en: 'Reset', sl: 'Ponastavi' },
	'drag drop widgets here': { en: 'Drag & Drop widgets here', sl: 'Prenesi gradnike sem' },
	'drag drop widgets': { en: 'Drag & Drop widgets', sl: 'Zgrabi, prenesi, odloži' },

	'width': { en: 'Width', sl: 'Širina' },
	'height': { en: 'Height', sl: 'Višina' },
	'url': { en: 'Url', sl: 'Povezava' },
	'formula': { en: 'Formula', sl: 'Formula' },

	'uploaded': { en: 'Uploaded', sl: 'Naloženo' },
	'modified': { en: 'Modified', sl: 'Spremenjeno' },
	'size': { en: 'Size', sl: 'Velikost' },
	'waiting': { en: 'Waiting', sl: 'Čakam' },
	'uploading...': { en: 'Uploading ...', sl: 'Nalagam ...' },
	'upload complete': { en: 'Upload complete', sl: 'Nalaganje končano' },
	'drop-files here': { en: 'Drop files here', sl: 'Prenesi datoteke sem' },
	'drop-or': { en: 'or', sl: 'ali' },
	'drop-select files': { en: 'Select files', sl: 'Izberi datoteke' },
	'file -name- too big': { en: 'File {0} too big', sl: 'Datoteka {0} je prevelika' },
	'delete confirm': { en: 'Are you sure to delete {0}?', sl: 'Ali si prepričan da želiš izbrisati {0}?' },

	'tag insert': { en: 'Insert tag', sl: 'Vstavi podatek' },

	'varName': { en: 'Var Name', sl: 'Ime Spremenljivke' },
	'repeat - current item is this var': { en: 'Current item will be accessible with this variable', sl: 'Trenutni element bo dostopen s to spremenljivko' },
	'repeat - index name': { en: 'Current index is inside: {0}', sl: 'Trenutni index je v: {0}' },

	'columns add': { en: 'Add column', sl: 'Dodaj stolpec' },
	'columns - empty = auto': { en: 'Empty = auto width', sl: 'Prazno = auto širina' },
	'current item is in var -name-': { en: 'current item is in variable {0}', sl: 'trenutni element je v spremenljivki {0}' },
	'variables': { en: 'Variables', sl: 'Spremenljivke' },
	'add var': { en: 'Add variable', sl: 'Dodaj Spremenljivko' },
	'var value': { en: 'Value', sl: 'Vrednost' },
	'var is reserved': { en: 'Specified variable name is reserved and cannot be used', sl: 'Ime spremenljivke je rezervirano in ne more biti uporabljeno' },
	'filter': { en: 'Filter', sl: 'Filter' },
	'adjust': { en: 'Adjust', sl: 'Prilagodi' },
	'border different sides': { en: 'Border different sides', sl: 'Okvir različne strani'},
	'background': { en: 'Background', sl: 'Ozadje' },
	'UpdateVar error variable not selected': { en: 'Error: variable not selected', sl: 'Napaka: Spremenljivka ni nastavljena' },
	'UpdateVar error variable doesnt exist': { en: 'Error: variable does not exist', sl: 'Napaka: Spremenljivka ne obstaja' },
	'UpdateVar error formula empty': { en: 'Error: formula should not be empty', sl: 'Napaka: formula ne sme biti prazna' },
	'data must be 2D array': { en: 'Data must be 2D array. Add transform CSV.', sl: 'Podatki morajo biti v obliki 2D tabele. Dodaj transformacijo CSV.' },
	'add row': { en: 'Add Row', sl: 'Dodaj Vrstico' },
	'add col': { en: 'Add Column', sl: 'Dodaj Stolpec' },

	'repeat - direction': { en: 'Direction', sl: 'Smer' },
	'repeat - direction rows': { en: 'Rows', sl: 'Vrstice' },
	'repeat - direction columns': { en: 'Columns', sl: 'Stolpci' },
	'repeat - direction grid': { en: 'Grid', sl: 'Mreža' },

	'no image selected': { en: 'No image selected', sl: 'Slika ni izbrana' },
	'load local json file': { en: 'Load local .json file', sl: 'Naloži lokalno .json datoteko' },
	'TextHtml initial value': { en: 'This is sample text', sl: 'To je vzorčni tekst' },
	'preview': { en: 'Preview', sl: 'Predogled' },
}

export type trKeys = keyof typeof tr2

export function TransName(name: string|{[key:string]:string}, lang?: string): string {
	if (typeof name == 'string')
		return name
	if (lang && lang in name)
		return name[lang]
	// todo get current lang
	if ('en' in name)
		return name.sl
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
