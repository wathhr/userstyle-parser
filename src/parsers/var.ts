import type { CustomParserArgs } from '../types.ts';
import type { Variable } from '../variables/mod.ts';
import * as v from '../variables/mod.ts';

type Result = Record<string, Variable>;
export function variable({ text, accumulator }: CustomParserArgs<Result>): Result {
  const [type, name, ...rest] = text.split(' ');
  if (!name) throw new Error(`Malformed @var declaration`)

  if (name in (accumulator ?? {})) throw new Error(`${name} is declared twice`);

  const [label, raw] = (() => {
    if (!rest[0]?.startsWith('"') && !rest[0]?.startsWith('\'')) throw new Error(`${name}'s label is not enclosed in quotes`);

    const quote = rest[0][0]!;
    const lastLabelItem = rest.findIndex(item => item.endsWith(quote));
    if (!lastLabelItem) throw new Error(`${name}'s label is not enclosed in quotes`);

    const label = rest.splice(0, lastLabelItem + 1).join(' ');
    const raw = rest.join(' ');

    return [label.substring(label.length - 1, 1), raw];
  })();

  const variable = (() => {
    switch (type as Variable['type']) {
      case 'text': return new v.Text(name, label, raw);
      case 'color': return new v.Color(name, label, raw);
      case 'checkbox': return new v.Checkbox(name, label, raw);
      case 'range': return new v.Range(name, label, raw);
      case 'number': return new v.Number(name, label, raw);
      case 'select': return new v.Select(name, label, raw);
    }
  })();

  return {
    ...accumulator,
    [name]: variable,
  };
}
