import parseColor from 'color-parse';
import { VariableBase } from './base.ts';
import { Range, Number } from './range.ts';
import { Select } from './select.ts';

export class Text extends VariableBase<string> {
  type = 'text' as const;
  defaultValue = this.raw;
}

export class Color extends VariableBase {
  type = 'color' as const;
  defaultValue = parseColor(this.raw);
}

export class Checkbox extends VariableBase<boolean> {
  type = 'checkbox' as const;
  defaultValue = this.raw === 'true' || this.raw === '1';
}

export { Range, Number, Select };

export type Variable = Text | Color | Checkbox | Range | Number | Select;
