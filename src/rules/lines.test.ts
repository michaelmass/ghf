import { assertEquals } from 'jsr:@std/assert@^0.224.0/assert-equals'
import { ruleLinesFunc } from './lines.ts'

Deno.test('rule file', async () => {
  const plans = await ruleLinesFunc({
    type: 'lines',
    content: 'line1\nline2\nline3\n',
    path: 'path/to/file',
  })

  assertEquals(plans, [
    {
      type: 'create',
      path: 'path/to/file',
      content: 'line1\nline2\nline3\n',
    },
  ])
})
