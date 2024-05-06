import { assertEquals } from 'jsr:@std/assert'
import { ruleFileFunc } from './file.ts'

Deno.test('rule file', async () => {
  const plans = await ruleFileFunc({
    type: 'file',
    content: 'content',
    path: 'path/to/file',
  })

  assertEquals(plans, [
    {
      type: 'create',
      path: 'path/to/file',
      content: 'content',
    },
  ])
})
