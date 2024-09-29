import { assertThrows, assertEquals } from '@std/assert';
import { parse as defaultParse } from '../mod.ts';

Deno.test('valid userstyle', () => {
  assertThrows(() => defaultParse(''));
  assertThrows(() => defaultParse('invalid'));
  assertThrows(() => defaultParse('@name test\n@namespace test'));
});

const parse = (text: string | string[]) => defaultParse([
  '/* ==UserStyle==',
  typeof text === 'string' ? text : text.join('\n'),
  '==/UserStyle== */',
].join('\n'), { requiredKeys: [] });

Deno.test('basic keys', () => {
  assertEquals(parse([
    '@name         example',
    '@namespace    https://example.com/',
    '@version      1.0.0',
    '@description  test',
    '@author       test',
    '@homepageURL  https://example.com/',
    '@supportURL   https://example.com/issues',
    '@updateURL    https://example.com/example.user.css',
    '@license      unlicense',
    '@preprocessor default',
  ]), {
    name: 'example',
    namespace: 'https://example.com/',
    version: {
      major: 1,
      minor: 0,
      patch: 0,
      build: [],
      prerelease: [],
    },
    description: 'test',
    author: {
      name: 'test',
      email: undefined,
      url: undefined,
    },
    homepageURL: 'https://example.com/',
    supportURL: 'https://example.com/issues',
    updateURL: 'https://example.com/example.user.css',
    license: 'Unlicense',
    preprocessor: 'default',
  });
});

Deno.test('advanced author key', () => {
  assertEquals(parse(
    '@author test <test@example.com> (https://example.com/)'),
    {
      author: {
        name: 'test',
        email: 'test@example.com',
        url: 'https://example.com/',
      },
    }
  );

  assertThrows(() => parse('@author test <@example.com>'));
  assertThrows(() => parse('@author test (https:/example.com/)'));
  assertThrows(() => parse('@author test <test@> (https://example.com)'));
});

Deno.test('vars', () => {
  const { var: vars } = parse([
    '@var checkbox fontEnable "Font enabled" 1',
    '@var text     fontSize   "Font size"    2.1em',
    '@var color    fontColor  "Font color"   #123456',
    '@var select   fontName   "Font name"    ["Arial", "Consolas*", "Times New Roman"]',
    '@var select   fontBkgd   "Body background color"   {',
    '  "Near Black": "#111111",',
    '  "Near White*": "#eeeeee"',
    '}',
    '@var text     bkgdImg    "Bkgd image"   "\'http://example.com/bkgd.jpg\'"',
    '@var text     logoImg    "Logo image"   none',
    '@var number   adOpacity  "Ad opacity"       [0.5, 0, 1, 0.1]',
    '@var range    imgHeight  "Max image height" [50, 10, 200, 10, "px"]',
  ]);

  assertEquals(vars?.fontEnable?.type, 'checkbox');
  assertEquals(vars?.fontEnable?.label, 'Font enabled');
  assertEquals(vars?.fontSize?.defaultValue, '2.1em');
  assertEquals(vars?.fontName?.defaultValue, 'Consolas');
  assertEquals((vars?.fontName?.options as Map<string, unknown>)?.size, 3);
  assertEquals(vars?.adOpacity?.defaultValue, 0.5);
  assertEquals(vars?.adOpacity?.info, {
    min: 0,
    max: 1,
    step: 0.1,
  });
});
