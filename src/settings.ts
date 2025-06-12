import { z } from './deps.ts'
import { parse } from './parse.ts'
import { ruleSchema } from './rules/index.ts'

export const settingsSchema = z.object({
  extends: z.string().array().optional(),
  presets: z.record(z.string(), ruleSchema.array()).default({}),
  rules: ruleSchema.array(),
})

export type Settings = z.infer<typeof settingsSchema>

export const loadSettings = async (filepath: string) => {
  const isRemote = filepath.startsWith('https://')

  const content = isRemote ? await (await fetch(filepath)).text() : await Deno.readTextFile(filepath) // TODO if https replace content with remote file content

  const extension = filepath.split('.').pop()

  const data = await parse(content, extension ?? '')

  const settings = settingsSchema.parse(data)

  const presetEntries = Object.entries(settings.presets)

  for (const [_, rules] of presetEntries) {
    for (const rule of rules) {
      if (rule.type === 'preset') {
        throw new Error('Presets cannot contain other presets')
      }
    }
  }

  if (settings.extends?.length) {
    for (const extend of settings.extends) {
      const extendedSettings = await loadSettings(extend)
      settings.presets = { ...extendedSettings.presets, ...settings.presets }
      settings.rules.push(...extendedSettings.rules)
    }
  }

  return settings
}
