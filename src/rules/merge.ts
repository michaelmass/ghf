import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'
import { contentSchema } from '../schemas.ts'

export const ruleMergeSchema = z.object({
  type: z.literal('merge'),
  path: z.string(),
  content: contentSchema,
})

type RuleMerge = z.infer<typeof ruleMergeSchema>

export const ruleMergeFunc = async (_: RuleMerge, __: FileSystem) => {
  // TODO implement ruleMergeFunc
}
