import { VariableBase } from './base.ts';

export class Select extends VariableBase<string> {
  type = 'select' as const;
  defaultValue = '';

  public options: Map<string, {
    value: string;
    label: string | undefined;
  }> = new Map();

  constructor(name: string, label: string, raw: string) {
    super(name, label, raw);

    const input = this.raw
      .replace("'", '"')
      .replace(/,\s*(]|})/g, '$1');

    const json = JSON.parse(input);
    if (typeof json !== 'object') throw new Error('Invalid select variable');

    if (Array.isArray(json)) {
      for (const item of json) {
        if (typeof item !== 'string') throw new Error('Invalid option value in select variable');

        const [name, label] = item.split(':');
        if (!name) throw new Error('Invalid select variable');

        if (name.endsWith('*')) {
          if (this.defaultValue) throw new Error('Duplicate default option in select variable');

          const value = name.substring(0, name.length - 1);
          this.defaultValue = value;
          this.options.set(this.defaultValue, { label, value });
          continue;
        }

        if (this.options.has(name)) throw new Error('Duplicate option in select variable');
        this.options.set(name, { label, value: name });
      }

      this.defaultValue ||= json[0].split(':')[0];
      return;
    }

    for (const [_name, value] of Object.entries(json)) {
      if (typeof value !== 'string') throw new Error('Invalid option value in select variable');

      const [name, label] = _name.split(':');
      if (!name) throw new Error('Invalid select variable');

      if (name.endsWith('*')) {
        if (this.defaultValue) throw new Error('Duplicate default option in select variable');

        this.defaultValue = name.substring(0, name.length - 1);
        this.options.set(this.defaultValue, { label, value });
        continue;
      }

      if (this.options.has(name)) throw new Error('Duplicate option in select variable');
      this.options.set(name, { label, value });
    }

    this.defaultValue ||= Object.keys(json)[0]!.split(':')[0]!;
  }
}
