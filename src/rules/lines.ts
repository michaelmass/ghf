import { z } from '../deps.ts'
import type { Plan } from '../plan.ts'

export const ruleLinesSchema = z.object({
  type: z.literal('lines'),
  content: z.string().array(),
})

type RuleLines = z.infer<typeof ruleLinesSchema>

export const ruleLinesFunc = async ({ content }: RuleLines): Promise<Plan[]> => {
  return []
}
