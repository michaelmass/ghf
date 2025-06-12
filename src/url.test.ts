import { assertEquals } from 'jsr:@std/assert'
import { normalizeUrl } from './url.ts'

Deno.test('normalizeUrl should normalize a url', () => {
  const url = normalizeUrl('https://github.com/username/repo/blob/main/path/to/file.json')
  assertEquals(url, 'https://github.com/username/repo/blob/main/path/to/file.json')
})

Deno.test('normalizeUrl should normalize a url with a query', () => {
  const url = normalizeUrl('https://github.com/username/repo/blob/main/path/to/file.json?query=1')
  assertEquals(url, 'https://github.com/username/repo/blob/main/path/to/file.json?query=1')
})

Deno.test('normalizeUrl should normalize a url with a fragment', () => {
  const url = normalizeUrl('https://github.com/username/repo/blob/main/path/to/file.json#fragment')
  assertEquals(url, 'https://github.com/username/repo/blob/main/path/to/file.json#fragment')
})

Deno.test('normalizeUrl should normalize a url with a path', () => {
  const url = normalizeUrl('https://github.com/username/repo/blob/main/path/to/file.json')
  assertEquals(url, 'https://github.com/username/repo/blob/main/path/to/file.json')
})

Deno.test('normalizeUrl should remove .. from the path', () => {
  const url = normalizeUrl('https://github.com/username/repo/blob/main/path/to/../file.json')
  assertEquals(url, 'https://github.com/username/repo/blob/main/path/file.json')
})

Deno.test('normalizeUrl should remove . from the path', () => {
  const url = normalizeUrl('https://github.com/username/repo/blob/main/path/to/./file.json')
  assertEquals(url, 'https://github.com/username/repo/blob/main/path/to/file.json')
})
