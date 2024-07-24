import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'
import { contentSchema, loadContent } from '../schemas.ts'

export const ruleLinesSchema = z.object({
  type: z.literal('lines'),
  content: contentSchema,
  path: z.string(),
})

type RuleLines = z.infer<typeof ruleLinesSchema>

export const ruleLinesFunc = async ({ content, path }: RuleLines, fs: FileSystem): Promise<void> => {
  const newContent = await loadContent(content)
  const oldContent = await fs.fetch(path)

  if (!oldContent) {
    await fs.write(path, newContent)
    return
  }

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

  const newLines = newContent
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  let value = oldContent
  let modified = false

  for (const newLine of newLines) {
    if (!oldLines[newLine]) {
      modified = true
      value = `${value.trim()}\n${newLine.trim()}`
    }
  }

  if (!modified) {
    return
  }

  await fs.write(path, `${value}\n`)
}
