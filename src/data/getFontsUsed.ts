/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2024
 * @license MIT
 */

import type { Report } from '../types';
import { FontStyle, combineFont } from '../widgets/PropertyFont';
import { getWidget } from '../widgets/allWidgets';
import type { Widget, WidgetItem } from '../widgets/types';

export default function getFontsUsed(
  report: Report,
  widgets: Widget[],
): FontStyle[] {
  const reportFont = combineFont(
    { name: 'sans-serif', weight: 400, italic: false },
    report.properties.font || {},
  );
  const fontsUsed: FontStyle[] = [reportFont];
  for (const c of report.widgets) {
    gatherFontsUsed(fontsUsed, widgets, reportFont, c);
  }
  return fontsUsed;
}

function gatherFontsUsed(
  used: FontStyle[],
  widgets: Widget[],
  parentFont: FontStyle,
  item: WidgetItem,
) {
  let font = parentFont;
  const widget = getWidget(widgets, item.type);
  if (widget.getFontsUsed) {
    const res = widget.getFontsUsed(parentFont, item);
    const arr = Array.isArray(res) ? res : [res];
    if (arr.length > 0) {
      font = arr[0];
    }
    arr.forEach(f => {
      if (!findFont(used, f)) {
        used.push(f);
      }
    });
  }
  for (const c of item.children) {
    gatherFontsUsed(used, widgets, font, c);
  }
}

function findFont(arr: FontStyle[], font: FontStyle): boolean {
  for (const f of arr) {
    if (compareFont(f, font)) {
      return true;
    }
  }
  return false;
}

function compareFont(a: FontStyle, b: FontStyle): boolean {
  return a.name === b.name && a.italic === b.italic && a.weight === b.weight;
}
