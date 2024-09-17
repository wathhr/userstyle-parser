import type { SemVer } from '@std/semver/types';
import type { license } from './parsers/license.ts';
import type { preprocessor } from './parsers/preprocessor.ts';
import type { Variable } from './variables/mod.ts';

export type CustomParser<T = unknown> = (args: CustomParserArgs<T>) => T;
export interface CustomParserArgs<T = unknown> {
  text: string,
  accumulator: T | undefined,
};

export interface ParseOpts<
  TCustomParsers extends Record<string, CustomParser> = never,
  TRequiredKeys extends keyof UserStyleMeta | keyof TCustomParsers = never,
  TInvalidAction extends 'ignore' | 'keep' | 'error' = 'error',
> {
  /**
   * Custom parsers for the non-standard keys.
   * These can overwrite the default parsers.
   *
   * `args.accumulator` is the returned value from the last run of the parser.
   * You will need to type it yourself using {@link CustomParserArgs}.
   */
  customParsers: TCustomParsers;
  requiredKeys: (TInvalidAction extends 'keep'
    ? NoInfer<TRequiredKeys> | string & Record<never, never>
    : NoInfer<TRequiredKeys>
  )[];
  /**
   * `ignore` - Will ignore a key if it's not recognized.
   *
   * `keep` - Will keep every key, if one is not handled it will just return its raw string.
   *
   * `error` - Will throw an error if a key is not recognized.
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
  license: ReturnType<typeof license>;
  preprocessor: ReturnType<typeof preprocessor>;
  var: Record<string, Variable>;
}
