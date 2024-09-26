import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'

export const ruleExecSchema = z.object({
  type: z.literal('exec'),
  cmd: z.string(),
  args: z.array(z.string()),
  cwd: z.string(),
  env: z.record(z.string()),
})

type RuleExec = z.infer<typeof ruleExecSchema>

export const ruleExecFunc = async (_: RuleExec, __: FileSystem) => {
  // TODO implement ruleExecFunc
}
