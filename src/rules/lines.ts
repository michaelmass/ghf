import { exists, z } from '../deps.ts'
import { plan, type Plan } from '../plan.ts'
import { contentSchema, loadContent } from '../schemas.ts'

export const ruleLinesSchema = z.object({
  type: z.literal('lines'),
  content: contentSchema,
  path: z.string(),
})

type RuleLines = z.infer<typeof ruleLinesSchema>

export const ruleLinesFunc = async ({ content, path }: RuleLines): Promise<Plan[]> => {
  const newContent = await loadContent(content)

  if (!(await exists(path))) {
    return [plan.create(path, newContent)]
  }

  const newLines = newContent
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const oldContent = await Deno.readTextFile(path)

  const oldLines = oldContent
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .reduce(
      (acc, line) => {
        acc[line] = true
        return acc
      },
      {} as Record<string, boolean>,
    )

  for (const newLine of newLines) {
    if (!oldLines[newLine]) {
      return [plan.update(path, oldContent, `${oldContent.trim()}\n${newContent.trim()}\n`)]
    }
  }

  return []
}
