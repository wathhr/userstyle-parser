import { parse as semverParse } from '@std/semver/mod.ts';
import type { CustomParserArgs, UserStyleMeta } from '../types.ts';
import { urlValidator } from './validators.ts';
import { author } from './author.ts';
import { license } from './license.ts';
import { preprocessor } from './preprocessor.ts';
import { variable } from './var.ts';

type Parsers = { [key in keyof UserStyleMeta]: (args: CustomParserArgs<UserStyleMeta[key]>) => UserStyleMeta[key] };

export const parsers = {
  name: ({ text }) => text,
  namespace: ({ text }) => text,
  version: ({ text }) => semverParse(text),
  description: ({ text }) => text,
  author,
  homepageURL: ({ text }) => urlValidator(text),
  supportURL: ({ text }) => urlValidator(text),
  updateURL: ({ text }) => urlValidator(text),
  license,
  preprocessor,
  var: variable
} satisfies Parsers;

export default parsers;

export * from './author.ts';
export * from './license.ts'
