import type { ParseOpts, UserStyleMeta, CustomParser } from './types.ts';
import type { ExtractLiterals, WithRequired } from './utils.ts';
import defaultParsers from './parsers/mod.ts';

const defaultOpts: ParseOpts<Record<string, never>, keyof UserStyleMeta, 'error'> = {
  customParsers: {},
  invalidKeyAction: 'error',
  requiredKeys: ['name', 'namespace', 'version'],
};

export function parse<
  TCustomParsers extends Record<string, CustomParser>,
  TRequiredKeys extends keyof UserStyleMeta | keyof TCustomParsers,
  TInvalidAction extends 'ignore' | 'keep' | 'error',
>(
  text: string,
  _opts: Partial<ParseOpts<TCustomParsers, TRequiredKeys, TInvalidAction>> = {},
): WithRequired<ExtractLiterals<TRequiredKeys>, Partial<
  & UserStyleMeta
  & { [K in keyof TCustomParsers]: ReturnType<TCustomParsers[K]> }
  & (TInvalidAction extends 'keep' ? Record<string & Record<never, never>, string> : Record<never, never>)
>> {
  const opts = { ...defaultOpts, ..._opts } as ParseOpts<TCustomParsers>;

  const parsers = {
    ...defaultParsers,
    ...opts.customParsers,
  };

  const meta: Record<string, unknown> = {};
  const accumulators: { [K in keyof typeof parsers]?: ReturnType<typeof parsers[K]> } = {};

  text = text.trim();
  const noStart = text.replace(/^\/\*\s*==UserStyle==/, '');
  if (noStart === text) throw new Error('Missing UserStyle header start');
  const noEnd = noStart.replace(/\s*==\/UserStyle==\s*\*\/\s*$/m, '');
  if (noEnd === noStart) throw new Error('Missing UserStyle header end');

  const lines = noEnd.split('\n@');
  while (lines.length) {
    const line = lines.shift()!.trim().replace(/\s{2,}/g, ' ');
    if (!line) continue;

    const parts = line.split(' ');
    const type = parts.shift() as keyof UserStyleMeta & keyof TCustomParsers;

    if (type in parsers) {
      // @ts-expect-error this is not typeable
      meta[type] = accumulators[type] = parsers[type]({
        text: parts.join(' '),
        accumulator: accumulators[type],
      });
    } else {
      if (opts.invalidKeyAction === 'error') throw new Error(`Unknown variable type: "${type}"`);
      else if (opts.invalidKeyAction === 'keep') meta[type] = parts.join(' ');
      else continue;
    }
  }

  for (const key of opts.requiredKeys) {
    if (key in meta) continue;
    throw new Error(`Missing required key: "${key}"`);
  }

  // @ts-expect-error if this is typeable then what the fuck
  return meta;
}

export * from './types.ts';
