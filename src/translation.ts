/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

// cannot enforce type
// otherwise its not object literal anymore and key type would be lost (it would be generic string)
const tr2 = {
  '': { en: '', sl: '' },
  report: { en: 'Report', sl: 'Poročilo' },
  reports: { en: 'Reports', sl: 'Poročila' },

  'font-weight-normal': { en: 'Normal', sl: 'Navadno' },
  'font-weight-bold': { en: 'Bold', sl: 'Krepko' },
  'font-style-normal': { en: 'Normal', sl: 'Navadno' },
  'font-style-italic': { en: 'Italic', sl: 'Ležeče' },
  'font-decoration-underline': { en: 'Underline', sl: 'Podčrtaj' },
  font: { en: 'Font', sl: 'Pisava' },
  'font-family': { en: 'Family', sl: 'Vrsta' },
  'font-size': { en: 'Size', sl: 'Velikost' },
  'font-line-height': { en: 'Line height', sl: 'Višina vrstice' },
  'font-style': { en: 'Style', sl: 'Stil' },
  'font-weight': { en: 'Weight', sl: 'Debelina' },
  'font-select-family': { en: 'Select Font Family', sl: 'Izberi Pisavo' },
  border: { en: 'Border', sl: 'Obroba' },
  'border-width': { en: 'Width', sl: 'Debelina' },
  'border-style': { en: 'Style', sl: 'Stil' },
  'border-solid': { en: 'Solid', sl: 'Polna' },
  'border-dashed': { en: 'Dashed', sl: 'Črtkano' },
  'border-dotted': { en: 'Dotted', sl: 'Pike' },
  'border-left': { en: 'Border Left', sl: 'Obroba Levo' },
  'border-right': { en: 'Border Right', sl: 'Obroba Desno' },
  'border-top': { en: 'Border Top', sl: 'Obroba Zgoraj' },
  'border-bottom': { en: 'Border Bottom', sl: 'Obroba Spodaj' },

  align: { en: 'Align', sl: 'Poravnaj' },
  'align-left': { en: 'Align Left', sl: 'Poravnaj Levo' },
  'align-center': { en: 'Align Center', sl: 'Poravnaj na Sredino' },
  'align-right': { en: 'Align Right', sl: 'Poravnaj Desno' },
  'align-justify': { en: 'Justify', sl: 'Razporedi' },

  color: { en: 'Color', sl: 'Barva' },
  enable: { en: 'Enable', sl: 'Omogoči' },
  empty: { en: 'Empty', sl: 'Prazno' },

  'upload bad file': {
    en: 'Uploaded bad file',
    sl: 'Naložena datoteka ni primerna',
  },
  'report upload finished': {
    en: 'Report upload finished. Manually drag and drop it to the document. It is available under "import" button.',
    sl: 'Nalaganje končano. Ročno primi in vstavi v dokument. Naložen dokument se nahaja pod gumbom "Uvozi".',
  },
  download: { en: 'Download', sl: 'Prenesi' },
  upload: { en: 'Upload', sl: 'Naloži' },
  widgets: { en: 'Widgets', sl: 'Gradniki' },
  predefined: { en: 'Predefined', sl: 'Predefinirano' },
  file: { en: 'File', sl: 'Datoteka' },
  'import export': { en: 'Import/Export', sl: 'Uvozi/Izvozi' },
  import: { en: 'Import', sl: 'Uvozi' },
  export: { en: 'Export', sl: 'Izvozi' },

  'invalid value': { en: 'invalid value', sl: 'Neveljavna vrednost' },

  name: { en: 'Name', sl: 'Ime' },
  'show more': { en: 'Show more', sl: 'Pokaži več' },
  'show less': { en: 'Show less', sl: 'Pokaži manj' },
  fileName: { en: 'File Name', sl: 'Ime datoteke' },
  paperWidth: { en: 'Paper Width', sl: 'Papir širina' },
  paperHeight: { en: 'Paper Height', sl: 'Papir višina' },
  paper: { en: 'Paper', sl: 'Papir' },
  '0 means default': { en: '0 means default', sl: '0 pomeni standardno' },
  margin: { en: 'Margin', sl: 'Odmik zunaj' },
  'margin top': { en: 'Margin Top', sl: 'Odmik Zgoraj' },
  'margin bottom': { en: 'Margin Bottom', sl: 'Odmik Spodaj' },
  padding: { en: 'Padding', sl: 'Odmik noter' },
  lang: { en: 'Language', sl: 'Jezik' },
  'lang 2 letter iso code': { en: '2 letter ISO code', sl: 'koda ISO 2 črke' },
  'users lang': { en: 'User Language', sl: 'Uporabnikov jezik' },
  'new name': { en: 'New name', sl: 'Novo ime' },
  'delete report': { en: 'Delete report', sl: 'Izbriši poročilo' },
  'delete report question': {
    en: 'Are you sure to delete this report?',
    sl: 'Ali si prepričan da želiš izbrisati to poročilo?',
  },

  'source data': { en: 'Source data', sl: 'Izvorni podatki' },
  'override source data': {
    en: 'Override source data',
    sl: 'Povozi izvorne podatke',
  },
  'clear override': { en: 'Clear override', sl: 'Odstrani povožene podatke' },
  transform: { en: 'Transform', sl: 'Transformacija' },
  'insert data transform': {
    en: 'Insert data transform',
    sl: 'Vstavi transformacijo',
  },
  up: { en: 'Up', sl: 'Gor' },
  down: { en: 'Down', sl: 'Dol' },
  delete: { en: 'Delete', sl: 'Izbriši' },
  remove: { en: 'Remove', sl: 'Odstrani' },
  edit: { en: 'Edit', sl: 'Uredi' },
  comment: { en: 'Comment', sl: 'Komentar' },
  save: { en: 'Save', sl: 'Shrani' },
  cancel: { en: 'Cancel', sl: 'Prekliči' },
  data: { en: 'Data', sl: 'Podatki' },
  field: { en: 'Field', sl: 'Polje' },
  condition: { en: 'Condition', sl: 'Pogoj' },

  replace: { en: 'Replace', sl: 'Zamenjaj' },
  reset: { en: 'Reset', sl: 'Ponastavi' },
  'drag drop widgets here': {
    en: 'Drag & Drop widgets here',
    sl: 'Prenesi gradnike sem',
  },
  'drag drop widgets': {
    en: 'Drag & Drop widgets',
    sl: 'Zgrabi, prenesi, odloži',
  },

  width: { en: 'Width', sl: 'Širina' },
  height: { en: 'Height', sl: 'Višina' },
  url: { en: 'Url', sl: 'Povezava' },
  formula: { en: 'Formula', sl: 'Formula' },

  uploaded: { en: 'Uploaded', sl: 'Naloženo' },
  modified: { en: 'Modified', sl: 'Spremenjeno' },
  size: { en: 'Size', sl: 'Velikost' },
  waiting: { en: 'Waiting', sl: 'Čakam' },
  'uploading...': { en: 'Uploading ...', sl: 'Nalagam ...' },
  'upload complete': { en: 'Upload complete', sl: 'Nalaganje končano' },
  'drop-files here': { en: 'Drop files here', sl: 'Prenesi datoteke sem' },
  'drop-or': { en: 'or', sl: 'ali' },
  'drop-select files': { en: 'Select files', sl: 'Izberi datoteke' },
  'file -name- too big': {
    en: 'File {0} too big',
    sl: 'Datoteka {0} je prevelika',
  },
  'delete confirm': {
    en: 'Are you sure to delete {0}?',
    sl: 'Ali si prepričan da želiš izbrisati {0}?',
  },

  tag: { en: 'Tag', sl: 'Podatek' },
  'insert tag': { en: 'Insert tag', sl: 'Vstavi podatek' },

  varName: { en: 'Variable', sl: 'Spremenljivka' },
  'repeat - current item is this var': {
    en: 'Current item will be accessible with this variable',
    sl: 'Trenutni element bo dostopen s to spremenljivko',
  },
  'repeat - index name': {
    en: 'Current index is inside: {0}',
    sl: 'Trenutni index je v: {0}',
  },

  'columns add': { en: 'Add column', sl: 'Dodaj stolpec' },
  'columns - empty = auto': {
    en: 'Empty = auto width',
    sl: 'Prazno = auto širina',
  },
  'current item is in var -name-': {
    en: 'current item is in variable {0}',
    sl: 'trenutni element je v spremenljivki {0}',
  },
  variables: { en: 'Variables', sl: 'Spremenljivke' },
  'add var': { en: 'Add variable', sl: 'Dodaj Spremenljivko' },
  'var value': { en: 'Value', sl: 'Vrednost' },
  'var is reserved': {
    en: 'Specified variable name is reserved and cannot be used',
    sl: 'Ime spremenljivke je rezervirano in ne more biti uporabljeno',
  },
  filter: { en: 'Filter', sl: 'Filter' },
  adjust: { en: 'Adjust', sl: 'Prilagodi' },
  'border different sides': {
    en: 'Border different sides',
    sl: 'Okvir različne strani',
  },
  background: { en: 'Background', sl: 'Ozadje' },
  'UpdateVar error variable not selected': {
    en: 'Error: variable not selected',
    sl: 'Napaka: Spremenljivka ni nastavljena',
  },
  'UpdateVar error variable doesnt exist': {
    en: 'Error: variable does not exist',
    sl: 'Napaka: Spremenljivka ne obstaja',
  },
  'UpdateVar error formula empty': {
    en: 'Error: formula should not be empty',
    sl: 'Napaka: formula ne sme biti prazna',
  },
  'data must be 2D array': {
    en: 'Data must be 2D array. Add transform CSV.',
    sl: 'Podatki morajo biti v obliki 2D tabele. Dodaj transformacijo CSV.',
  },
  'add row': { en: 'Add Row', sl: 'Dodaj Vrstico' },
  'add col': { en: 'Add Column', sl: 'Dodaj Stolpec' },

  'repeat - direction': { en: 'Direction', sl: 'Smer' },
  'repeat - direction rows': { en: 'Rows', sl: 'Vrstice' },
  'repeat - direction columns': { en: 'Columns', sl: 'Stolpci' },
  'repeat - direction grid': { en: 'Grid', sl: 'Mreža' },

  'no image selected': { en: 'No image selected', sl: 'Slika ni izbrana' },
  'load json file': {
    en: 'Load json file',
    sl: 'Naloži json datoteko',
  },
  'load url': { en: 'Load URL', sl: 'Naloži URL' },
  'local json file': { en: 'Local json file', sl: 'Lokalna json datoteka' },
  'TextHtml initial value': {
    en: 'This is sample text',
    sl: 'To je vzorčni tekst',
  },
  preview: { en: 'Preview', sl: 'Predogled' },
  other: { en: 'Other', sl: 'Drugo' },
  'page-break-avoid': {
    en: 'Avoid page break',
    sl: 'Izogibaj se prelomu strani',
  },

  'img-fit': { en: 'Fit', sl: 'Prilagodi' },
  'img-fit-fill': { en: 'Fill', sl: 'Zapolni' },
  'img-fit-contain': { en: 'Contain', sl: 'Pomanjšaj' },
  'img-fit-cover': { en: 'Cover', sl: 'Povečaj' },

  'select image': { en: 'Select image', sl: 'Izberi sliko' },
  close: { en: 'Close', sl: 'Zapri' },
  error: { en: 'Error', sl: 'Napaka' },
  'uploaded report': { en: 'Uploaded report', sl: 'Naložen report' },

  inherit: { en: 'Inherit', sl: 'Podeduj' },
  none: { en: 'None', sl: 'Brez' },
};

export type trKeys = keyof typeof tr2;

let currentLang = 'en';

export function setEditorLanguage(lang: string): void {
  currentLang = lang;
}

export function getEditorLanguage(): string {
  return currentLang;
}

/**
 * Name is used for translating strings.
 * It can be `string` or `object` with 2-letter lower case ISO language keys.
 */
export type TransName = string | { [lang: string]: string };

export function transName(name: TransName, lang?: string): string {
  if (typeof name == 'string') {
    return name;
  }
  if (lang && lang in name) {
    return name[lang];
  }
  if (currentLang in name) {
    return name[currentLang];
  }
  const keys = Object.keys(name);
  if (keys.length > 0) {
    return name[keys[0]];
  }
  return '';
}

export default function trans(key: trKeys, params?: unknown[]): string {
  let n = transName(tr2[key]);
  const regex = /{(\d+)}/gm;
  const pl = params ? params.length : 0;
  n = n.replace(regex, (match, p0) => {
    const idx = parseInt(p0);
    if (idx >= 0 && idx < pl) {
      return String(params?.[idx]);
    }
    return 'undefined';
  });
  return n;
}
