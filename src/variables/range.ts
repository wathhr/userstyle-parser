import { VariableBase } from './base.ts';

class RangeBase extends VariableBase {
  type = '';
  defaultValue: number | undefined = undefined;

  info: Partial<{
    min: number | null;
    max: number | null;
    step: number | null;
    unit: string;
  }> = {};

  constructor(name: string, label: string, raw: string) {
    super(name, label, raw);

    const input = this.raw
      .replaceAll('\'', '"')
      .replace(/,\s*]/g, ']');

    const json = JSON.parse(input);
    if (!Array.isArray(json)) throw new Error('Invalid range variable');

    for (const i in json) {
      const value: unknown = json[i];
      if (typeof value === 'string') {
        this.info.unit ??= value;
        continue;
      }

      if (typeof value !== 'number' && value !== null) throw new Error('Invalid range variable');

      if (this.defaultValue === undefined) {
        if (value === null) throw new Error('Default value of range cannot be "null"');
        this.defaultValue = value;
        continue;
      }

      if (this.info.min === undefined) {
        this.info.min = value;
        continue;
      }

      if (this.info.max === undefined) {
        this.info.max = value;
        continue;
      }

      if (this.info.step === undefined) {
        this.info.step = value;
        continue;
      }
    }

    if (this.defaultValue === undefined) throw new Error('Range variable did not provide a default value');
  }
}

export class Range extends RangeBase {
  override type = 'range' as const;
}

export class Number extends RangeBase {
  override type = 'number' as const;
}
