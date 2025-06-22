import { assertEquals } from 'jsr:@std/assert'
import { TestFileSystem } from '../util.test.ts'
import { ruleDeleteFunc } from './delete.ts'

Deno.test('rule delete should remove the file from the filesystem if it exists', async () => {
  const rule = {
    type: 'delete',
    path: 'path/to/file',
  } as const

  const fs = TestFileSystem({
    [rule.path]: 'content',
  })

  await ruleDeleteFunc(rule, fs)

  assertEquals(await fs.read(rule.path), null)
})

Deno.test('rule delete should remove the file from the filesystem', async () => {
  const fs = TestFileSystem()

  const rule = {
    type: 'delete',
    path: 'path/to/file',
  } as const

  await ruleDeleteFunc(rule, fs)

  assertEquals(await fs.read(rule.path), undefined)
})
