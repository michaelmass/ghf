import { assertEquals } from 'jsr:@std/assert'
import { ruleFileFunc } from './file.ts'
import { TestFileSystem } from '../util.test.ts'

Deno.test('rule file should create a file', async () => {
  const fs = TestFileSystem()

  const rule = {
    type: 'file',
    content: 'random_content',
    path: 'path/to/file',
  } as const

  await ruleFileFunc(rule, fs)

  assertEquals(await fs.read(rule.path), rule.content)
})

Deno.test('rule file should replace a file if already exists', async () => {
  const fs = TestFileSystem()

  const rule = {
    type: 'file',
    content: 'random_content',
    path: 'path/to/file',
  } as const

  await fs.write(rule.path, 'old_content')

  await ruleFileFunc(rule, fs)

  assertEquals(await fs.read(rule.path), rule.content)
})

Deno.test('rule file should not update the file if the content is the same', async () => {
  const fs = TestFileSystem({
    'path/to/file': 'random_content',
  })

  const rule = {
    type: 'file',
    content: 'random_content',
    path: 'path/to/file',
  } as const

  await ruleFileFunc(rule, fs)

  assertEquals(await fs.read(rule.path), undefined)
})
