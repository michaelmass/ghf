import { z } from '../deps.ts'

export const rulePresetSchema = z.object({
  type: z.literal('preset'),
  name: z.string(),
})

type RulePreset = z.infer<typeof rulePresetSchema>

export const rulePresetFunc = async ({ name }: RulePreset) => {}
