import { assertEquals, assertThrows } from 'jsr:@std/assert'
import { resolveRegistry } from './settings.ts'

Deno.test('resolveRegistry expands @ghf to the registry URL', () => {
  assertEquals(resolveRegistry('@ghf/default.json'), 'https://michaelmass.github.io/ghf/ghf/default.json')
})

Deno.test('resolveRegistry leaves https URLs untouched', () => {
  assertEquals(resolveRegistry('https://example.com/foo.json'), 'https://example.com/foo.json')
})

Deno.test('resolveRegistry leaves relative paths untouched', () => {
  assertEquals(resolveRegistry('../ghf.json'), '../ghf.json')
})

Deno.test('resolveRegistry throws on unknown registry', () => {
  assertThrows(() => resolveRegistry('@unknown/foo.json'), Error, 'Unknown registry "@unknown"')
})
