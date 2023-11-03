/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import type { TFontStyle } from './PropertyFont';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

async function load(apiKey: string) {
  const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${encodeURIComponent(
    apiKey,
  )}&sort=popularity`;
  const r = await fetch(url);
  if (!r.ok) {
    throw new Error('Error fetching fonts');
  }
  const js = (await r.json()) as GoogleFontsApiResponse;
  return js.items;
}

interface GoogleFontsApiEntry {
  kind: string;
  family: string;
  subsets: string[];
  variants: string[];
  version: string;
  lastModified: string;
  files: { [key: string]: string };
}
interface GoogleFontsApiResponse {
  kind: string;
  items: GoogleFontsApiEntry[];
}
interface FontSelectorProps {
  apiKey: string;
  value: string;
  onChange: (selected: string) => void;
}

let cache: GoogleFontsApiEntry[] | undefined = undefined;
export function GoogleFontSelector(props: FontSelectorProps) {
  const [list, setList] = useState<GoogleFontsApiEntry[]>(cache || []);
  useEffect(() => {
    if (cache) {
      return;
    }
    load(props.apiKey).then(list2 => {
      cache = list2;
      setList(cache);
    });
  }, [props.apiKey]);

  const selected = props.value.toLowerCase();
  return (
    <List sx={{ pt: 0, minWidth: '20rem' }}>
      {list.map(e => (
        <ListItem disableGutters key={e.family}>
          <ListItemButton
            onClick={() => props.onChange(e.family)}
            selected={e.family.toLowerCase() === selected}
          >
            <ListItemText primary={e.family} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

export function GoogleFontUrlImport(arr: TFontStyle[]): string | undefined {
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
  ];
  const group: { [key: string]: TFontStyle[] } = {};
  for (const obj of arr) {
    const name2 = obj.name.toLowerCase();
    if (systemFonts.indexOf(name2) !== -1) {
      continue;
    }
    if (!(obj.name in group)) {
      group[obj.name] = [];
    }
    const exists = group[obj.name].find(
      x => x.weight === obj.weight && x.italic === obj.italic,
    );
    if (!exists) {
      group[obj.name].push(obj);
    }
  }
  // sort values
  const families = Object.keys(group).sort();
  let url = '';
  for (const name of families) {
    const values = group[name];
    values.sort((a, b) => {
      if (!a.italic && b.italic) {
        return -1;
      }
      if (a.italic && !b.italic) {
        return 1;
      }
      return a.weight - b.weight;
    });
    url += url.length === 0 ? '?' : '&';
    url += `family=${encodeURIComponent(name)}:ital,wght@`;
    url += values.map(v => `${v.italic ? '1' : '0'},${v.weight}`).join(';');
  }
  if (url.length === 0) {
    return undefined;
  }
  return `https://fonts.googleapis.com/css2${url}&display=swap`;
}

export function destructGoogleFontUrl(url: string): TFontStyle[] {
  if (!url.startsWith('https://fonts.googleapis.com/css2')) {
    // url doesnt look like Google Font url
    // cant be favicon.ico or something else
    return [];
  }
  const urlObj = new URL(url);
  url = urlObj.search;
  if (url.startsWith('?')) {
    url = url.substring(1);
  }
  const parts = url
    .split('&')
    .filter(v => v.startsWith('family='))
    .map(v => v.substring(7));
  const arr: TFontStyle[] = [];
  for (const val of parts) {
    const idxAt = val.indexOf('@');
    if (idxAt === -1) {
      const name = decodeURIComponent(val.replaceAll('+', ' '));
      arr.push({ name, italic: false, weight: 400 });
      continue;
    }
    const untilAt = val.substring(0, idxAt);
    const idxColon = untilAt.indexOf(':');
    if (idxColon === -1) {
      throw new Error('missing colon');
    }
    const name = decodeURIComponent(
      untilAt.substring(0, idxColon).replaceAll('+', ' '),
    );
    const keys = untilAt.substring(idxColon + 1).split(',');
    const idxItal = keys.indexOf('ital');
    const idxWeight = keys.indexOf('wght');
    const vals = val
      .substring(idxAt + 1)
      .split(';')
      .map(x => x.trim())
      .filter(x => x.length)
      .map(v => {
        const vals2 = v.split(',');
        while (vals2.length < keys.length) {
          vals2.push('');
        }
        return vals2;
      });

    for (const v of vals) {
      const weight =
        (idxWeight !== -1 ? parseFloat(v[idxWeight]) : undefined) || 400;
      const italic = v[idxItal] === '1';
      arr.push({ name, weight, italic });
    }
  }
  return arr;
}

export function LoadGoogleFontCss(obj: TFontStyle): void {
  const els = window.document.getElementsByTagName('link');
  for (const el of els) {
    if (el.rel !== 'stylesheet') {
      continue;
    }
    const arr = destructGoogleFontUrl(el.href);
    const exists = arr.find(
      x =>
        x.name === obj.name &&
        x.weight === obj.weight &&
        x.italic === obj.italic,
    );
    if (exists) {
      return;
    }
  }
  if (typeof window.document === 'undefined') {
    throw new Error('LoadGoogleFontCss() is only available on browser.');
  }
  const url = GoogleFontUrlImport([obj]);
  if (!url) {
    return;
  }
  const link = window.document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  window.document.head.appendChild(link);
}
