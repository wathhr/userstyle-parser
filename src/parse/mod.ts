/**
 * The parser for {@link https://github.com/openstyles/stylus/wiki/Writing-UserCSS | userstyles}
 *
 * @module
 */

import type { ParseOpts, UserStyleMeta, CustomParser, Position } from '#types';
import type { WithRequired } from '../utils.ts';
import defaultParsers, { genericParser } from './parsers/mod.ts';

export class ParseError extends Error {
  override name = 'ParseError';

  public position: Position;
  constructor(opts: { position: Position, message: string }) {
    super(opts.message);
    this.position = opts.position;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * USE WITH CAUTION!
 *
 * Updating the values of this object can mess up the position on thrown errors
 */
export const globalPosition: Position = {
  line: 1,
  column: 1,
};

const defaultOpts: ParseOpts<Record<never, never>, never, 'error'> = {
  customParsers: {},
  invalidKeyAction: 'error',
  requiredKeys: [],
};

/**
 * Parses a userstyle string into an object
 * @param opts The default required keys are 'name', 'namespace', 'version'
 *
 * @throws When encountering invalid syntax/mistakes in the userstyle or if the userstyle does not include a required key
 *
 * @example Basic usage
 * ```ts
 * import { parse } from 'jsr:@wathhr/userstyle-parser';
 *
 * const result = parse(`/* ==UserStyle==
 * \@name example
 * \@namespace https://example.com/
 * \@version v0.1.0
 * ==/UserStyle== \*\/`);
 *
 * console.log(result.name);    // => example
 * console.log(result.version); // => { major: 0, minor: 1, patch: 0 }
 * ```
 *
 * @example Custom keys
 * ```ts
 * import { parse, createCustomParser } from 'jsr:@wathhr/userstyle-parser';
 *
 * const result = parse(userstyleString, {
 *   requiredKeys: ['name', 'namespace', 'example'],
 *   customParsers: {
 *     example: createCustomParser<number>(({ text }) => parseInt(text)),
 *   },
 * });
 *
 * result.name;        // string
 * result.description; // string | undefined
 * result.example;     // number
 * ```
 */
export function parse<
  TCustomParsers extends Record<string, CustomParser>,
  TInvalidAction extends 'ignore' | 'keep' | 'error' = 'error',
  TRequiredKeys extends TInvalidAction extends 'keep'
    ? (keyof UserStyleMeta | keyof TCustomParsers) | string & Record<never, never>
    : (keyof UserStyleMeta | keyof TCustomParsers) = never,
>(
  text: string,
  _opts: Partial<ParseOpts<TCustomParsers, TRequiredKeys, TInvalidAction>> = {},
): WithRequired<TRequiredKeys,
  (TInvalidAction extends 'keep' ? Record<string, string> : Record<never, never>) &
  Partial<UserStyleMeta & { [K in keyof TCustomParsers]: ReturnType<TCustomParsers[K]> }>
> {
  const opts = { ...defaultOpts, ..._opts } as ParseOpts<TCustomParsers>;

  const parsers = {
    ...defaultParsers,
    ...opts.customParsers,
  };

  const meta: Record<string, unknown> = {};
  const accumulators: { [K in keyof typeof parsers]?: ReturnType<typeof parsers[K]> } = {};

  text = text.trim();
  const noStart = text.replace(/^\s*\/\*\s*==UserStyle==/, '');
  if (noStart === text) throw new Error('Missing UserStyle header start');
  const noEnd = noStart.replace(/\s*==\/UserStyle==\s*\*\/\s*$/m, '');
  if (noEnd === noStart) throw new Error('Missing UserStyle header end');

  const keys = noEnd.split('\n@').slice(1);
  while (keys.length) {
    globalPosition.line++;
    globalPosition.column = 2; // because of the `@` in the split

    const key = keys.shift();
    if (!key) continue;

    const parts = key.split(' ');
    const type = parts.shift()!;

    if (type in parsers) {
      globalPosition.column += type.length;

      try {
        // @ts-expect-error this is not typeable
        meta[type] = accumulators[type]! = parsers[type]!({
          text: parts.join(' '),
          accumulator: accumulators[type],
        });
      } catch (err) {
        if (err instanceof Error) throw new ParseError({
          ...err,
          message: `Failed to parse a "${type}" key: ${err.message}`,
          position: globalPosition,
        });

        throw err;
      }
    } else {
      if (opts.invalidKeyAction === 'error') throw new ParseError({ message: `Unknown key type "${type}"`, position: globalPosition });
      else if (opts.invalidKeyAction === 'keep') meta[type] = genericParser({ text: parts.join(' '), accumulator: undefined });
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

export * from './parsers/mod.ts';
