import { assertEquals } from 'jsr:@std/assert'
import { TestFileSystem } from '../util.test.ts'
import { ruleMergeFunc } from './merge.ts'

Deno.test('rule merge should create a new json file with the content if not exists', async () => {
  const fs = TestFileSystem()
  const filename = 'path/to/file.json'

  const rule = {
    type: 'merge' as const,
    path: filename,
    content: JSON.stringify({ test: 'test', b: 'c' }),
    mergeArrays: false,
  }

  await ruleMergeFunc(rule, fs)

  assertEquals(await fs.read(filename), JSON.stringify({ test: 'test', b: 'c' }))
})

Deno.test('rule merge should create a new yaml file with the content if not exists', async () => {
  const fs = TestFileSystem()
  const filename = 'path/to/file.yaml'

  const rule = {
    type: 'merge' as const,
    path: filename,
    content: 'test: 1\nfoo: bar',
    mergeArrays: false,
  }

  await ruleMergeFunc(rule, fs)

  assertEquals(await fs.read(filename), 'test: 1\nfoo: bar\n')
})

Deno.test('rule merge should create a new yml file with the content if not exists', async () => {
  const fs = TestFileSystem()
  const filename = 'path/to/file.yml'

  const rule = {
    type: 'merge' as const,
    path: filename,
    content: 'test: 1\nfoo: bar',
    mergeArrays: false,
  }

  await ruleMergeFunc(rule, fs)

  assertEquals(await fs.read(filename), 'test: 1\nfoo: bar\n')
})

Deno.test('rule merge should merge the content of a file with another', async () => {
  const fs = TestFileSystem()
  const filename = 'path/to/file.json'

  await fs.write(filename, JSON.stringify({ test: 'test', b: 'c' }))

  const rule = {
    type: 'merge' as const,
    path: filename,
    content: JSON.stringify({ test: 'test2', foo: 'bar' }),
    mergeArrays: false,
  }

  await ruleMergeFunc(rule, fs)

  assertEquals(await fs.read(filename), JSON.stringify({ test: 'test2', b: 'c', foo: 'bar' }))
})
