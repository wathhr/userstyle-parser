import { assertEquals } from '@std/assert';
import { Text, Color, Checkbox } from './mod.ts';

Deno.test('parses text variables', () => {
  const TextVariable = new Text('test', 'Test', 'test');
  assertEquals(TextVariable.type, 'text');
  assertEquals(TextVariable.defaultValue, 'test');
});

Deno.test('parses color variables', () => {
  const NameColorVariable = new Color('test', 'Test', 'red');
  assertEquals(NameColorVariable.type, 'color');
  assertEquals(NameColorVariable.defaultValue, {
    alpha: 1,
    space: 'rgb',
    values: [255, 0, 0],
  });

  const OklchColorVariable = new Color('test', 'Test', 'oklch(48% 0.210 22)');
  assertEquals(OklchColorVariable.defaultValue, {
    space: 'oklch',
    values: [0.48, 0.21, 22],
    alpha: 1,
  });
});

Deno.test('parses checkbox variables', () => {
  const CheckboxVariable = new Checkbox('test', 'Test', 'true');
  assertEquals(CheckboxVariable.type, 'checkbox');
  assertEquals(CheckboxVariable.defaultValue, true);

  const NumberCheckboxVariable = new Checkbox('test', 'Test', '1');
  assertEquals(NumberCheckboxVariable.defaultValue, true);
});
