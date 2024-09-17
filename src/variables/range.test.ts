import { assertEquals, assertThrows } from '@std/assert';
import { Range } from './range.ts';

Deno.test('parses range variables', () => {
  const RangeVariable = new Range('test', 'Test', '[0, 1, 100, 1, "em"]');
  assertEquals(RangeVariable.type, 'range');
  assertEquals(RangeVariable.defaultValue, 0);
  assertEquals(RangeVariable.info.min, 1);
  assertEquals(RangeVariable.info.max, 100);
  assertEquals(RangeVariable.info.step, 1);
  assertEquals(RangeVariable.info.unit, 'em');

  const UnitPlacementRangeVariable = new Range('test', 'Test', "[50, 'px', 100, ]");
  assertEquals(UnitPlacementRangeVariable.defaultValue, 50);
  assertEquals(UnitPlacementRangeVariable.info.min, 100);
  assertEquals(UnitPlacementRangeVariable.info.max, undefined);
  assertEquals(UnitPlacementRangeVariable.info.step, undefined);
  assertEquals(UnitPlacementRangeVariable.info.unit, 'px');

  const SkipValueRangeVariable = new Range('test', 'Test', '[10, null, 100, 2]');
  assertEquals(SkipValueRangeVariable.defaultValue, 10);
  assertEquals(SkipValueRangeVariable.info.min, null);
  assertEquals(SkipValueRangeVariable.info.max, 100);
  assertEquals(SkipValueRangeVariable.info.step, 2);

  assertThrows(() => new Range('test', 'Test', '[]'));
  assertThrows(() => new Range('test', 'Test', '[null, 0, 100, 2]'));
});
