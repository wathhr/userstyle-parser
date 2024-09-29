import type { Variable } from '../variables/mod.ts';
import * as v from '../variables/mod.ts';
import { ParseError } from '../mod.ts';
import { createCustomParser } from './custom.ts';

type Result = Record<string, Variable>;
export const variable = createCustomParser<Result>(({ accumulator }, { position, nextPart }) => {
  const type = nextPart().value;
  if (!type) throw new ParseError({ message: 'Missing variable type', position });

  const name = nextPart().value;
  if (!name) throw new ParseError({ message: 'Missing variable name', position });
  if (name in (accumulator ?? {})) throw new Error(`${name} is declared twice`);

  const [label, raw] = (() => {
    let label = '';
    let quote = '';
    while (true) {
      const part = nextPart();
      if (part.done) throw new ParseError({ message: 'Unfinished label', position });
      const value = part.value;

      if (!label) {
        if (!value?.startsWith('\'') && !value.startsWith('"')) throw new ParseError({ message: 'Label must be quoted', position });
        quote = value[0]!;
      } else if (value.indexOf(quote) !== -1) {
        label += value;
        break;
      }

      label += value + ' ';
      if (part.done) throw new ParseError({ message: 'Label quote was not closed', position });
    }

    let raw = '';
    while (true) {
      const part = nextPart();
      if (part.done) break;
      raw &&= raw + ' ';
      raw += part.value;
    }

    return [label.substring(label.length - 1, 1), raw];
  })();

  if (!raw) throw new ParseError({ message: 'No default value provided', position });

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
});
