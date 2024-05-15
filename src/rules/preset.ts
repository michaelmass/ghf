import { z } from '../deps.ts'
import type { FileSystem } from '../filesystem.ts'
import type { Settings } from '../settings.ts'

export const rulePresetSchema = z.object({
  type: z.literal('preset'),
  name: z.string(),
})

type RulePreset = z.infer<typeof rulePresetSchema>

export const rulePresetFunc = async ({ name }: RulePreset, fileSystem: FileSystem, settings: Settings) => {
  const preset = settings.presets[name]

  if (!preset) {
    throw new Error(`Preset not found: ${name}`)
  }

  for (const rule of preset) {
    // await applyRule(rule, fileSystem, settings)
  }
}
