import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'
import { contentSchema, loadContent } from '../schemas.ts'

export const ruleFileSchema = z.object({
  type: z.literal('file'),
  path: z.string(),
  content: contentSchema,
})

type RuleFile = z.infer<typeof ruleFileSchema>

export const ruleFileFunc = async ({ content, path }: RuleFile, fileSystem: FileSystem) => {
  const newContent = await loadContent(content)
  fileSystem.write(path, newContent)
}
