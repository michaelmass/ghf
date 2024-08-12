import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'
import { loadContent } from '../schemas.ts'
import { contentSchema } from '../schemas.ts'

export const ruleInitSchema = z.object({
  type: z.literal('init'),
  path: z.string(),
  content: contentSchema,
})

type RuleInit = z.infer<typeof ruleInitSchema>

export const ruleInitFunc = async ({ path, content }: RuleInit, fs: FileSystem) => {
  const exists = (await fs.fetch(path)) !== undefined

  if (exists) {
    return
  }

  const newContent = await loadContent(content)

  await fs.write(path, newContent)
}
