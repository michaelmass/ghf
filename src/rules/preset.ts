import { z } from '../deps.ts'
import type { Plan } from '../plan.ts'
import type { Settings } from '../settings.ts'

export const rulePresetSchema = z.object({
  type: z.literal('preset'),
  name: z.string(),
})

type RulePreset = z.infer<typeof rulePresetSchema>

export const rulePresetFunc = async ({ name }: RulePreset, settings: Settings): Promise<Plan[]> => {
  return []
}
