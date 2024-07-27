import { assertEquals } from 'jsr:@std/assert'
import { ruleLinesFunc } from './lines.ts'
import { TestFileSystem } from '../util.test.ts'

Deno.test('rule lines should create a file with lines if not exists', async () => {
  const fs = TestFileSystem()

  const rule = {
    type: 'lines',
    content: 'line1\nline2\nline3\n',
    path: 'path/to/file',
  } as const

  await ruleLinesFunc(rule, fs)

  assertEquals(await fs.read('path/to/file'), rule.content)
})

Deno.test('rule lines should append lines to a file if already exists', async () => {
  const fs = TestFileSystem()

  const rule = {
    type: 'lines',
    content: 'line1\nline2\n',
    path: 'path/to/file',
  } as const

  await fs.write(rule.path, 'line1\nline2\nline3\n')

  await ruleLinesFunc(rule, fs)

  assertEquals(await fs.read(rule.path), 'line1\nline2\nline3\n')
})

Deno.test('rule lines should only update the file if the lines are not already there', async () => {
  const content = 'line1\nline2\nline3\n'
  const path = 'path/to/file'

  const fs = TestFileSystem({ [path]: content })

  const rule = {
    type: 'lines',
    path,
    content,
  } as const

  await ruleLinesFunc(rule, fs)

  assertEquals(await fs.read(path), undefined)
})
