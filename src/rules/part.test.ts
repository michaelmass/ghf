import { assertEquals } from 'jsr:@std/assert'
import { TestFileSystem } from '../util.test.ts'
import { rulePartFunc } from './part.ts'

Deno.test('rule part with strategy content should create a file if it does not exist', async () => {
  const fs = TestFileSystem()

  const rule = {
    type: 'part',
    content: 'random_content',
    path: 'path/to/part',
    strategy: 'content',
  } as const

  await rulePartFunc(rule, fs)

  assertEquals(await fs.read(rule.path), rule.content)
})

Deno.test('rule part with strategy start should create a file if it does not exist', async () => {
  const fs = TestFileSystem()

  const rule = {
    type: 'part',
    content: 'random_content',
    path: 'path/to/part',
    strategy: 'start',
  } as const

  await rulePartFunc(rule, fs)

  assertEquals(await fs.read(rule.path), rule.content)
})

Deno.test('rule part with strategy end should create a file if it does not exist', async () => {
  const fs = TestFileSystem()

  const rule = {
    type: 'part',
    content: 'random_content',
    path: 'path/to/part',
    strategy: 'end',
  } as const

  await rulePartFunc(rule, fs)

  assertEquals(await fs.read(rule.path), rule.content)
})

Deno.test('rule part with strategy start should add a part to the start of the file', async () => {
  const fs = TestFileSystem()

  const oldContent = 'old_content'

  const rule = {
    type: 'part',
    content: 'random_content',
    path: 'path/to/part',
    strategy: 'start',
  } as const

  await fs.write(rule.path, oldContent)

  await rulePartFunc(rule, fs)

  assertEquals(await fs.read(rule.path), `${rule.content}${oldContent}`)
})

Deno.test('rule part with strategy end should add a part to the end of the file', async () => {
  const fs = TestFileSystem()

  const oldContent = 'old_content'

  const rule = {
    type: 'part',
    content: 'random_content',
    path: 'path/to/part',
    strategy: 'end',
  } as const

  await fs.write(rule.path, oldContent)

  await rulePartFunc(rule, fs)

  assertEquals(await fs.read(rule.path), `${oldContent}${rule.content}`)
})

Deno.test('rule part with strategy content should add a part to the end of the file', async () => {
  const fs = TestFileSystem()

  const oldContent = 'old_content'

  const rule = {
    type: 'part',
    content: 'random_content',
    path: 'path/to/part',
    strategy: 'content',
  } as const

  await fs.write(rule.path, oldContent)

  await rulePartFunc(rule, fs)

  assertEquals(await fs.read(rule.path), `${oldContent}${rule.content}`)
})

Deno.test('rule part with strategy start should do nothing if the file already contains the part', async () => {
  const fs = TestFileSystem()

  const oldContent = 'random_content old_content'

  const rule = {
    type: 'part',
    content: 'random_content',
    path: 'path/to/part',
    strategy: 'start',
  } as const

  await fs.write(rule.path, oldContent)

  await rulePartFunc(rule, fs)

  assertEquals(await fs.read(rule.path), oldContent)
})

Deno.test('rule part with strategy end should do nothing if the file already contains the part', async () => {
  const fs = TestFileSystem()

  const oldContent = 'old_content random_content'

  const rule = {
    type: 'part',
    content: 'random_content',
    path: 'path/to/part',
    strategy: 'end',
  } as const

  await fs.write(rule.path, oldContent)

  await rulePartFunc(rule, fs)

  assertEquals(await fs.read(rule.path), oldContent)
})

Deno.test('rule part with strategy content should do nothing if the file already contains the part', async () => {
  const fs = TestFileSystem()

  const oldContent = 'old_content random_content old_content'

  const rule = {
    type: 'part',
    content: 'random_content',
    path: 'path/to/part',
    strategy: 'content',
  } as const

  await fs.write(rule.path, oldContent)

  await rulePartFunc(rule, fs)

  assertEquals(await fs.read(rule.path), oldContent)
})
