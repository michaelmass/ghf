import { assertEquals } from 'jsr:@std/assert'
import { TestFileSystem } from '../util.test.ts'
import { ruleFileFunc } from './file.ts'
import { ruleResetFunc } from './reset.ts'

Deno.test('rule reset should reset the file before applying any change', async () => {
  const fs = TestFileSystem()

  const path = 'path/to/file'

  const ruleFile = {
    type: 'file',
    path,
    content: 'random_content',
  } as const

  const ruleReset = {
    type: 'reset',
    path,
  } as const

  await ruleFileFunc(ruleFile, fs)

  assertEquals(await fs.read(path), ruleFile.content)

  await ruleResetFunc(ruleReset, fs)

  assertEquals(await fs.read(path), undefined)
})
