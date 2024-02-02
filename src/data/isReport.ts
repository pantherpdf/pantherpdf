/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import type { WidgetItem } from '../widgets/types';
import type { Report } from '../types';

function isWidgetItem(r2: unknown): r2 is WidgetItem {
  if (typeof r2 != 'object' || !r2) {
    return false;
  }
  const r = r2 as { [k: string]: unknown };
  if (typeof r.type !== 'string' || r.type.length === 0) {
    return false;
  }
  if (!Array.isArray(r.children)) {
    return false;
  }
  for (const ch of r.children) {
    if (!isWidgetItem(ch)) {
      return false;
    }
  }
  return true;
}

/**
 * Type guard for Report interface
 */
export default function isReport(r2: unknown): r2 is Report {
  if (typeof r2 != 'object' || !r2) {
    return false;
  }
  const r = r2 as { [k: string]: unknown };
  if (!Array.isArray(r.widgets)) {
    return false;
  }
  for (const ch of r.widgets) {
    if (!isWidgetItem(ch)) {
      return false;
    }
  }
  if (typeof r.properties !== 'object' || !r.properties) {
    return false;
  }
  //
  if (!Array.isArray(r.variables)) {
    return false;
  }
  if (!Array.isArray(r.transforms)) {
    return false;
  }
  return true;
}
