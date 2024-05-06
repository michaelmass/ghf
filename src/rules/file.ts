import { z } from '../deps.ts'

export const ruleFileSchema = z.object({
  type: z.literal('file'),
  content: z.string(),
})

type RuleFile = z.infer<typeof ruleFileSchema>

export const ruleFileFunc = async ({ content }: RuleFile) => {}
