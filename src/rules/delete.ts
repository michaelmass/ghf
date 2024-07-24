import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'

export const ruleDeleteSchema = z.object({
  type: z.literal('delete'),
  path: z.string(),
})

type RuleDelete = z.infer<typeof ruleDeleteSchema>

export const ruleDeleteFunc = async ({ path }: RuleDelete, fs: FileSystem) => {
  const exists = (await fs.fetch(path)) !== undefined

  if (exists) {
    await fs.delete(path)
  }
}
