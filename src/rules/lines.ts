import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'
import { contentSchema, loadContent } from '../schemas.ts'

export const ruleLinesSchema = z.object({
  type: z.literal('lines'),
  path: z.string(),
  content: contentSchema,
  remove: z.boolean().optional().describe('Remove the lines from the file instead of adding them'),
})

type RuleLines = z.infer<typeof ruleLinesSchema>

export const ruleLinesFunc = async ({ content, path, remove }: RuleLines, fs: FileSystem): Promise<void> => {
  const newContent = await loadContent(content)
  const oldContent = await fs.fetch(path)

  if (!oldContent) {
    await fs.write(path, newContent)
    return
  }

  const { value, modified } = remove ? removeLines(oldContent, newContent) : addLines(oldContent, newContent)

  if (!modified) {
    return
  }

  await fs.write(path, `${value.trim()}\n`)
}

const removeLines = (oldContent: string, newContent: string) => {
  let value = ''
  let modified = false

  const oldLines = oldContent
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const newLines = newContent
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

  for (const oldLine of oldLines) {
    if (!newLines[oldLine]) {
      value += `${oldLine.trim()}\n`
    } else {
      modified = true
    }
  }

  return {
    value,
    modified,
  }
}

const addLines = (oldContent: string, newContent: string) => {
  let value = oldContent.trim()
  let modified = false

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

  for (const newLine of newLines) {
    if (!oldLines[newLine]) {
      modified = true
      value += `\n${newLine.trim()}`
    }
  }

  return {
    value,
    modified,
  }
}
