import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'

export const ruleResetSchema = z.object({
  type: z.literal('reset'),
  path: z.string(),
})

type RuleReset = z.infer<typeof ruleResetSchema>

export const ruleResetFunc = ({ path }: RuleReset, fs: FileSystem) => {
  const newContent = ''
  fs.write(path, newContent)
}
