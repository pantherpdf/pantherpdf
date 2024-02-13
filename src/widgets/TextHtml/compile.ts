import { listOfAdjusts } from '../formulaAdjust';
import { CompileHelper, WidgetItem } from '../types';
import type { TextHtmlCompiled, TextHtmlData } from './TextHtml';

export default async function compile(
  item: WidgetItem,
  helper: CompileHelper,
): Promise<TextHtmlCompiled> {
  const dt = item as TextHtmlData;
  // combine parts
  let html = '';
  for (const part of dt.value) {
    const type = part.type;
    switch (type) {
      case 'html': {
        html += part.value;
        break;
      }
      case 'formula': {
        let value = await helper.evalFormula(part);
        if (part.adjust && part.adjust.length > 0) {
          const adjustObj = listOfAdjusts.find(x => x.id === part.adjust);
          if (!adjustObj) {
            throw new Error(`Unknown adjust ${part.adjust}`);
          }
          value = adjustObj.func(value, []);
        }
        html += String(value);
        break;
      }
      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`Unknown data type: ${exhaustiveCheck}`);
      }
    }
  }
  return {
    type: dt.type,
    value: html,
    font: dt.font,
  };
}
