import { assertEquals } from 'jsr:@std/assert'
import { TestFileSystem } from '../util.test.ts'
import { ruleInitFunc } from './init.ts'

Deno.test('rule init should not create the file if it exists', async () => {
  const rule = {
    type: 'init',
    path: 'path/to/file',
    content: 'test',
  } as const

  const fs = TestFileSystem({
    [rule.path]: 'content',
  })

  await ruleInitFunc(rule, fs)

  assertEquals(await fs.read(rule.path), undefined)
})

Deno.test('rule init should create the file in the filesystem', async () => {
  const fs = TestFileSystem()

  const rule = {
    type: 'init',
    path: 'path/to/file',
    content: 'test',
  } as const

  await ruleInitFunc(rule, fs)

  assertEquals(await fs.read(rule.path), 'test')
})
