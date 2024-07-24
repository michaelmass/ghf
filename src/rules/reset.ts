import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'

export const ruleResetSchema = z.object({
  type: z.literal('reset'),
  path: z.string(),
})

type RuleReset = z.infer<typeof ruleResetSchema>

export const ruleResetFunc = async ({ path }: RuleReset, fs: FileSystem) => {
  await fs.reset(path)
}
