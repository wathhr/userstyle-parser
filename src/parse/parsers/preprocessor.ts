import { ParseError } from '../mod.ts';
import { createCustomParser } from './custom.ts';

export const preprocessors = ['default', 'uso', 'less', 'stylus'] as const;

export type Preprocessor = typeof preprocessors[number];
export const preprocessor = createCustomParser<Preprocessor>((_, { position, nextPart }) => {
  const text = nextPart().value as Preprocessor;
  if (preprocessors.includes(text)) return text;
  throw new ParseError({ message: `Invalid preprocessor: "${text}"`, position });
});
