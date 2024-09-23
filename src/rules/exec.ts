import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'

export const ruleExecSchema = z.object({
  type: z.literal('exec'),
})

type RuleExec = z.infer<typeof ruleExecSchema>

export const ruleExecFunc = async (_: RuleExec, __: FileSystem) => {
  // TODO implement ruleExecFunc
}
