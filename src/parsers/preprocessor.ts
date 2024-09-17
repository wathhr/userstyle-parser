import type { CustomParserArgs } from '../types.ts';

export const preprocessors = ['default', 'uso', 'less', 'stylus'] as const;

export type Preprocessor = typeof preprocessors[number];
export function preprocessor({ text: _text }: CustomParserArgs): Preprocessor {
  const text = _text as Preprocessor;
  if (preprocessors.includes(text)) return text;
  throw new Error('Invalid preprocessor');
}
