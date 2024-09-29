import type { UserStyleMeta } from '#types';
import { ParseError } from '../mod.ts';
import { createCustomParser } from './custom.ts';
import { emailValidator, urlValidator } from './validators.ts';

export const author = createCustomParser<UserStyleMeta['author']>((_, { nextPart, position }) => {
  let name = '';
  let email: string | undefined = undefined;
  let url: string | undefined = undefined;
  while (true) {
    const part = nextPart();
    if (part.done) break;

    if (part.value.startsWith('<')) {
      if (!part.value.endsWith('>')) throw new ParseError({ message: 'Email specifier not closed', position });
      email = part.value.slice(1, -1);
      continue;
    }

    if (part.value.startsWith('(')) {
      if (!part.value.endsWith(')')) throw new ParseError({ message: 'URL specifier not closed', position });
      url = part.value.slice(1, -1);
      continue;
    }

    if (email || url) throw new ParseError({ message: 'Email or URL specifier cannot be between author name', position });

    name &&= name + ' ';
    name += part.value;
  }

  if (email) try {
    emailValidator(email);
  } catch (err) {
    throw new ParseError({ ...err, position });
  }

  if (url) try {
    urlValidator(url);
  } catch (err) {
    throw new ParseError({ ...err, position });
  }

  return { name, email, url };
});
