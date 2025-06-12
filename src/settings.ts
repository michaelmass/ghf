import { z } from './deps.ts'
import { parse } from './parse.ts'
import { ruleSchema } from './rules/index.ts'
import type { Content } from './schemas.ts'
import { normalizeUrl } from './url.ts'

export const settingsSchema = z.object({
  extends: z.string().array().optional(),
  presets: z.record(z.string(), ruleSchema.array()).default({}),
  rules: ruleSchema.array(),
})

export type Settings = z.infer<typeof settingsSchema>

export const loadSettings = async (filepath: string) => {
  const isRemote = filepath.startsWith('https://')

  const content = isRemote ? await (await fetch(filepath)).text() : await Deno.readTextFile(filepath)

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

  if (isRemote) {
    const remote = filepath.substring(0, filepath.lastIndexOf('/'))

    for (const rule of settings.rules) {
      switch (rule.type) {
        case 'file':
          rule.content = replacePathWithRemote(rule.content, remote)
          break
        case 'init':
          rule.content = replacePathWithRemote(rule.content, remote)
          break
        case 'lines':
          rule.content = replacePathWithRemote(rule.content, remote)
          break
        case 'merge':
          rule.content = replacePathWithRemote(rule.content, remote)
          break
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

const replacePathWithRemote = (content: Content, remote: string): Content => {
  if (typeof content === 'string') {
    return content
  }

  if ('url' in content) {
    return content
  }

  if ('path' in content) {
    return {
      url: normalizeUrl(`${remote}/${content.path}`),
    }
  }

  throw new Error('Unsupported content type')
}
