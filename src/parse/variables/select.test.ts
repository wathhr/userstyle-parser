import { assertEquals, assertThrows } from '@std/assert';
import { Select } from './select.ts';

Deno.test('parses select variables', () => {
  const SelectVariable = new Select('test', 'Test', '["test"]');
  assertEquals(SelectVariable.type, 'select');
  assertEquals(SelectVariable.defaultValue, 'test');
  assertEquals(SelectVariable.options.size, 1);
  assertEquals(SelectVariable.options.get('test'), {
    label: undefined,
    value: 'test',
  });

  const AliasSelectVariable = new Select('test', 'Test', '["test:Test", "test2*:Test 2", "test3:Test 3"]');
  assertEquals(AliasSelectVariable.defaultValue, 'test2');
  assertEquals(AliasSelectVariable.options.size, 3);
  assertEquals(AliasSelectVariable.options.get('test'), {
    label: 'Test',
    value: 'test',
  });
  assertEquals(AliasSelectVariable.options.get('test2'), {
    label: 'Test 2',
    value: 'test2',
  });
  assertEquals(AliasSelectVariable.options.get('test3'), {
    label: 'Test 3',
    value: 'test3',
  });

  const ObjectSelectVariable = new Select('test', 'test', '{"test": "test 1", "test2*": "test 2"}');
  assertEquals(ObjectSelectVariable.defaultValue, 'test2');
  assertEquals(ObjectSelectVariable.options.size, 2);
  assertEquals(ObjectSelectVariable.options.get('test'), {
    label: undefined,
    value: 'test 1',
  });
  assertEquals(ObjectSelectVariable.options.get('test2'), {
    label: undefined,
    value: 'test 2',
  });

  assertThrows(() => new Select('test', 'Test', '[test]'));
  assertThrows(() => new Select('test', 'Test', '[\'test\']'));
  assertThrows(() => new Select('test', 'Test', '["test", "test"]'));
  assertThrows(() => new Select('test', 'Test', '["test:Test", "test:Test 2"]'));
  assertThrows(() => new Select('test', 'Test', '{"test:Test": "test", "test:Test 2": "test 2"}'));
});
