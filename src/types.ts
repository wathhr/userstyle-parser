import type { SemVer } from '@std/semver/types';
import type { License } from './parse/parsers/license.ts';
import type { Preprocessor } from './parse/parsers/preprocessor.ts';
import type { Variable } from './parse/variables/mod.ts';
// deno-lint-ignore no-unused-vars
import type { createCustomParser } from './mod.ts';

export interface Position {
  /** 1-indexed */
  line: number;
  /** 1-indexed */
  column: number;
}

export type CustomParser<T = unknown> = (args: CustomParserArgs<T>) => T;
export interface CustomParserArgs<T = unknown> {
  text: string,
  accumulator: T | undefined,
}

export interface ParseOpts<
  TCustomParsers extends Record<string, CustomParser> = never,
  TRequiredKeys extends keyof UserStyleMeta | keyof TCustomParsers = never,
  TInvalidAction extends 'ignore' | 'keep' | 'error' = 'error',
> {
  /**
   * Custom parsers for the non-standard keys; can overwrite the default parsers
   *
   * `args.accumulator` is the returned value from the last run of the parser.
   * It is recommended to use {@linkcode createCustomParser} as it does most of the heavy lifting here,
   * else you should be using the {@linkcode CustomParser} type
   */
  customParsers: TCustomParsers;
  /** The keys required for the userstyle string to have, if any of the keys are not found the function throws */
  requiredKeys: (TInvalidAction extends 'keep'
    ? TRequiredKeys | string & Record<never, never>
    : TRequiredKeys
  )[];
  /**
   * `ignore` - Will ignore a key if it's not recognized
   *
   * `keep` - Will keep every key, if one is not handled it will just return its raw string
   *
   * `error` - Will throw an error if a key is not recognized
   */
  invalidKeyAction: TInvalidAction;
}

export interface UserStyleMeta {
  name: string;
  namespace: string;
  version: SemVer;
  description: string;
  author: {
    name: string;
    email: string | undefined;
    url: string | undefined;
  };
  homepageURL: string;
  supportURL: string;
  updateURL: string;
  license: License;
  preprocessor: Preprocessor;
  var: Record<string, Variable>;
}
