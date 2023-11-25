/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import {
  faAlignCenter,
  faAlignJustify,
  faAlignLeft,
  faAlignRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { tuple } from '../types';
import Trans, { trKeys } from '../translation';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

export const TAligns = tuple('left', 'center', 'right', 'justify');
export type TAlign = (typeof TAligns)[number];

interface AlignProps {
  value: TAlign | undefined;
  onChange: (value: TAlign | undefined) => void;
}

const dt: { value: TAlign; icon: IconDefinition; transKey: trKeys }[] = [
  { value: 'left', icon: faAlignLeft, transKey: 'align-left' },
  { value: 'center', icon: faAlignCenter, transKey: 'align-center' },
  { value: 'right', icon: faAlignRight, transKey: 'align-right' },
  { value: 'justify', icon: faAlignJustify, transKey: 'align-justify' },
];

export default function PropertyAlign(props: AlignProps) {
  return (
    <div>
      <ToggleButtonGroup
        exclusive
        value={props.value}
        onChange={(e, newVal) =>
          props.onChange(newVal !== props.value ? newVal : undefined)
        }
      >
        {dt.map(x => (
          <ToggleButton
            key={x.value}
            value={x.value}
            aria-label={Trans(x.transKey)}
          >
            <FontAwesomeIcon icon={x.icon} fixedWidth />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
}
