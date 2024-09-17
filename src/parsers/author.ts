import type { CustomParserArgs, UserStyleMeta } from '../types.ts';
import { emailValidator, urlValidator } from './validators.ts';

export function author({ text }: CustomParserArgs): UserStyleMeta['author'] {
  const email = text.split('<')[1]?.split('>')[0];
  const url = text.split('(')[1]?.split(')')[0];
  const name = text
    .replace(`<${email}>`, '')
    .replace(`(${url})`, '')
    .trim();

  if (email) emailValidator(email);
  if (url) urlValidator(url);

  return { name, email, url };
}
