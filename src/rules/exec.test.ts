import { assertEquals } from 'jsr:@std/assert'
import { TestFileSystem } from '../util.test.ts'
import { ruleExecFunc } from './exec.ts'

Deno.test('rule exec should execute a command', async () => {
  const fs = TestFileSystem()

  const rule = {
    type: 'exec' as const,
    cmd: 'echo',
    args: ['test'],
    outfile: 'path/to/file',
  }

  await ruleExecFunc(rule, fs)

  assertEquals(await fs.read('path/to/file'), 'test\n')
})
