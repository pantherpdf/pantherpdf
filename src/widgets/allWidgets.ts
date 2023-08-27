/**
 * allWidgets.tsx
 * list of all widgets
 */

import type { Widget } from '../editor/types';
import { TextSimple } from './TextSimple';
import { Repeat } from './Repeat';
import { TextHtml } from './TextHtml';
import { Image } from './Image';
import { Columns, ColumnsCt } from './Columns';
import { Condition } from './Condition';
import { FirstMatch } from './FirstMatch';
import { Html } from './Html';
import { Separator } from './Separator';
import { Spacer } from './Spacer';
import { PageBreak } from './PageBreak';
import { Frame } from './Frame';
import { SetVar } from './SetVar';
import { UpdateVar } from './UpdateVar';

export const defaultWidgets: Widget[] = [
  TextSimple,
  TextHtml,
  Repeat,
  Image,
  Columns,
  ColumnsCt,
  Condition,
  FirstMatch,
  Html,
  Separator,
  Spacer,
  PageBreak,
  Frame,
  SetVar,
  UpdateVar,
];

export function getWidget(arr: Widget[], type: string): Widget {
  const c = arr.find(x => x.id === type);
  if (!c) {
    throw new Error(`Missing widget ${type}`);
  }
  return c;
}
