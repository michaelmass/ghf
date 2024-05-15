import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'
import { contentSchema, loadContent } from '../schemas.ts'

export const ruleLinesSchema = z.object({
  type: z.literal('lines'),
  content: contentSchema,
  path: z.string(),
})

type RuleLines = z.infer<typeof ruleLinesSchema>

export const ruleLinesFunc = async ({ content, path }: RuleLines, fileSystem: FileSystem): Promise<void> => {
  const newContent = await loadContent(content)
  const oldContent = await fileSystem.read(path)

  if (!oldContent) {
    fileSystem.write(path, newContent)
    return
  }

  const newLines = newContent
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

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
      fileSystem.write(path, `${oldContent.trim()}\n${newContent.trim()}\n`)
      return
    }
  }
}
