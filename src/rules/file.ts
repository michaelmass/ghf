import { z, exists } from '../deps.ts'
import { type Plan, plan } from '../plan.ts'
import { contentSchema, loadContent } from '../schemas.ts'

export const ruleFileSchema = z.object({
  type: z.literal('file'),
  path: z.string(),
  content: contentSchema,
})

type RuleFile = z.infer<typeof ruleFileSchema>

export const ruleFileFunc = async ({ content, path }: RuleFile): Promise<Plan[]> => {
  const newContent = await loadContent(content)

  if (!(await exists(path))) {
    return [plan.create(path, newContent)]
  }

  const oldContent = await Deno.readTextFile(path)

  if (newContent !== oldContent) {
    return [plan.update(path, oldContent, newContent)]
  }

  return []
}
