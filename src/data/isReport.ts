/**
 * @jest-environment node
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import type { WidgetItem } from '../widgets/types';
import type { Report } from '../types';

function isWidgetItem(r: any): r is WidgetItem {
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
export default function isReport(r: any): r is Report {
  if (typeof r != 'object' || !r) {
    return false;
  }
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
