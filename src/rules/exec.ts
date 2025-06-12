import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'

export const ruleExecSchema = z.object({
  type: z.literal('exec'),
  cmd: z.string(),
  args: z.array(z.string()),
  cwd: z.string(),
  env: z.record(z.string(), z.string()),
})

type RuleExec = z.infer<typeof ruleExecSchema>

export const ruleExecFunc = async ({ cmd, args, cwd, env }: RuleExec, __: FileSystem) => {
  const command = new Deno.Command(cmd, {
    args,
    cwd,
    env,
  })

  const output = await command.output()

  if (output.code !== 0) {
    throw new Error(`Command exited with code ${output.code}`)
  }
  // TODO implement ruleExecFunc
}
