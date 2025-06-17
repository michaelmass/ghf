import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'
import { contentSchema, loadContent } from '../schemas.ts'

const strategyFormatFuncs = {
  start: (oldContent: string, newContent: string) => `${newContent}${oldContent}`,
  end: (oldContent: string, newContent: string) => `${oldContent}${newContent}`,
  content: (oldContent: string, newContent: string) => `${oldContent}${newContent}`,
}

const strategyCompareFuncs = {
  start: (oldContent: string, newContent: string) => oldContent.startsWith(newContent),
  end: (oldContent: string, newContent: string) => oldContent.endsWith(newContent),
  content: (oldContent: string, newContent: string) => oldContent.includes(newContent),
}

export const rulePartSchema = z.object({
  type: z.literal('part'),
  path: z.string(),
  content: contentSchema,
  strategy: z.enum(['start', 'end', 'content']).optional().default('content'),
})

type RulePart = z.infer<typeof rulePartSchema>

export const rulePartFunc = async ({ content, path, strategy }: RulePart, fs: FileSystem) => {
  const newContent = await loadContent(content)

  const oldContent = await fs.fetch(path)

  const compareFunc = strategyCompareFuncs[strategy]
  const formatFunc = strategyFormatFuncs[strategy]

  if (!compareFunc || !formatFunc) {
    throw new Error(`Unsupported strategy: ${strategy}`)
  }

  if (compareFunc(oldContent ?? '', newContent)) {
    return
  }

  await fs.write(path, formatFunc(oldContent ?? '', newContent))
}
