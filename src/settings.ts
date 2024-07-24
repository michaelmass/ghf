import { z } from './deps.ts'
import { parse } from './parse.ts'
import { ruleSchema } from './rules/index.ts'

export const settingsSchema = z.object({
  extends: z.string().array().optional(),
  presets: z.record(ruleSchema.array()),
  rules: ruleSchema.array(),
})

export type Settings = z.infer<typeof settingsSchema>

export const loadSettings = async (filepath: string) => {
  const content = await Deno.readTextFile(filepath)

  const extension = filepath.split('.').pop()

  const data = parse(content, extension ?? '')

  const settings = settingsSchema.parse(data)

  const presetEntries = Object.entries(settings.presets)

  for (const [_, rules] of presetEntries) {
    for (const rule of rules) {
      if (rule.type === 'preset') {
        throw new Error('Presets cannot contain other presets')
      }
    }
  }

  return settings
}
