import { parse as semverParse } from '@std/semver';
import type { CustomParser, CustomParserArgs, UserStyleMeta } from '#types';
import { ParseError } from '../mod.ts';
import { createCustomParser } from './custom.ts';
import { urlValidator } from './validators.ts';
import { author } from './author.ts';
import { license } from './license.ts';
import { preprocessor } from './preprocessor.ts';
import { variable } from './var.ts';

export const genericParser: CustomParser<string> = createCustomParser<string>((_, { nextPart, position }) => {
  const part = nextPart();
  if (part.done) throw new ParseError({ message: 'No value provided', position });
  return part.value;
});

/** The parsers for all the official userstyle metadata keys */
export const defaultParsers: { [key in keyof UserStyleMeta]: (args: CustomParserArgs<UserStyleMeta[key]>) => UserStyleMeta[key] } = {
  name: genericParser,
  namespace: genericParser,
  version: createCustomParser((_, { nextPart, position }) => {
    const part = nextPart();
    if (part.done) throw new ParseError({ message: 'No value provided', position });
    return semverParse(part.value);
  }),
  description: genericParser,
  author,
  homepageURL: createCustomParser((_, { nextPart, position }) => {
    const part = nextPart();
    if (part.done) throw new ParseError({ message: 'No value provided', position });
    return urlValidator(part.value);
  }),
  supportURL: createCustomParser((_, { nextPart, position }) => {
    const part = nextPart();
    if (part.done) throw new ParseError({ message: 'No value provided', position });
    return urlValidator(part.value);
  }),
  updateURL: createCustomParser((_, { nextPart, position }) => {
    const part = nextPart();
    if (part.done) throw new ParseError({ message: 'No value provided', position });
    return urlValidator(part.value);
  }),
  license,
  preprocessor,
  var: variable
};

export default defaultParsers;

export { createCustomParser };
export type { Preprocessor } from './preprocessor.ts';
export type { License } from './license.ts';
