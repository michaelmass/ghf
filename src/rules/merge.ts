import { merge } from 'npm:ts-deepmerge@7.0.3'
import { parseYaml, stringifyYaml, z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'
import { contentSchema, loadContent } from '../schemas.ts'

const parseFuncs = {
  yaml: parseYaml,
  yml: parseYaml,
  json: JSON.parse,
} as const satisfies Record<string, (content: string) => Promise<unknown> | unknown>

const stringifyFuncs = {
  yaml: stringifyYaml,
  yml: stringifyYaml,
  json: JSON.stringify,
}

type ContentType = keyof typeof parseFuncs

export const ruleMergeSchema = z.object({
  type: z.literal('merge'),
  path: z.string(),
  mergeArrays: z.boolean().optional().default(true),
  content: contentSchema,
})

type RuleMerge = z.infer<typeof ruleMergeSchema>

export const ruleMergeFunc = async ({ path, content, mergeArrays }: RuleMerge, fs: FileSystem) => {
  const newContent = await loadContent(content)
  const oldContent = await fs.fetch(path)

  if (oldContent === newContent) {
    return
  }

  const type = path.split('.').pop()

  const parseFunc = parseFuncs[type as ContentType]
  const stringifyFunc = stringifyFuncs[type as ContentType]

  if (!parseFunc || !stringifyFunc) {
    throw new Error(`Unsupported content type: ${type}`)
  }

  const newData = await parseFunc(newContent)

  if (!oldContent) {
    await fs.write(path, stringifyFunc(newData))
    return
  }

  const oldData = await parseFunc(oldContent)

  const mergedData = merge.withOptions({ mergeArrays }, oldData, newData)

  await fs.write(path, stringifyFunc(mergedData))
}
