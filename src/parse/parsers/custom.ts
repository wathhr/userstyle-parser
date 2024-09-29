import type { CustomParser, Position } from '#types';
import type { AddParameters } from '../../utils.ts';
import { globalPosition } from '../mod.ts';

type Extras = {
  /** The position relative to the current key */
  position: Position;
  /** Helper function which trims the whitespace of a string, updating {@linkcode Extras.position | position} appropriately */
  trim(text: string): string;
  /** Helper function which gives you the next "part" of the text, updating {@linkcode Extras.position | position} appropriately
   *
   * - A part is defined as characters separated by whitespace
   */
  nextPart(): IteratorResult<string, undefined>;
};

export const createCustomParser = <T>(cb: AddParameters<CustomParser<T>, [extra: Extras]>): CustomParser<T> => (args) => {
  const position: Position = {
    line: 1,
    column: 1,
  };

  function* partsGenerator() {
    let text = extras.trim(args.text);
    while (text) {
      const [value, ...rest] = text.split(/(?=\s)/);
      position.column += value!.length;
      yield extras.trim(value!);
      text = extras.trim(rest.join(''));
    }

    return undefined;
  }

  const parts = partsGenerator();

  const extras: Extras = {
    position,
    trim(text) {
      const arr = text.split('');
      while (arr.length) {
        const char = arr.shift()!;
        if (char === '\n') {
          position.line++;
          position.column = 1;
          continue;
        }

        if (char.trim() === '') {
          position.column++;
          continue;
        }

        arr.unshift(char);
        break;
      }

      return arr.join('');
    },
    nextPart: parts.next.bind(parts),
  };

  try {
    return cb({
      ...args,
      text: extras.trim(args.text)
    }, extras);
  } finally {
    globalPosition.line += position.line - 1;
    globalPosition.column = position.column;
  }
};
