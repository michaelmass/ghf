import { assertEquals } from 'jsr:@std/assert'
import { TestFileSystem } from '../util.test.ts'
import { ruleLinesFunc } from './lines.ts'

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
  const content1 = 'line1\nline2\nline3\n'
  const content2 = '\nline2\nline3\nline1\n'
  const path1 = 'path/to/file1'
  const path2 = 'path/to/file2'

  const fs = TestFileSystem({ [path1]: content1, [path2]: content2 })

  const rule1 = {
    type: 'lines',
    path: path1,
    content: content1,
  } as const

  const rule2 = {
    type: 'lines',
    path: path2,
    content: content1,
  } as const

  await ruleLinesFunc(rule1, fs)
  await ruleLinesFunc(rule2, fs)

  assertEquals(await fs.read(path1), undefined)
  assertEquals(await fs.read(path2), undefined)
})

Deno.test('rule lines should remove lines from a file if remove is true', async () => {
  const content1 = 'line1\nline2\nline3\n'
  const content2 = 'line1\nline2\n'
  const path1 = 'path/to/file1'

  const fs = TestFileSystem({ [path1]: content1 })

  const rule1 = {
    type: 'lines',
    path: path1,
    content: content2,
    remove: true,
  } as const

  await ruleLinesFunc(rule1, fs)

  assertEquals(await fs.read(path1), 'line3\n')
})
