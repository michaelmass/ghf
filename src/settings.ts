import { z } from './deps.ts'
import { fileExists } from './fs.ts'
import { parse } from './parse.ts'
import { type Rule, ruleSchema } from './rules/index.ts'
import type { Content } from './schemas.ts'
import { normalizeUrl } from './url.ts'

export const settingsSchema = z.object({
  $schema: z.string().optional(),
  extends: z.string().array().optional(),
  presets: z.record(z.string(), ruleSchema.array()).optional(),
  rules: ruleSchema.array().optional(),
})

export type Settings = z.infer<typeof settingsSchema>

const findSettingsFile = async () => {
  const files = ['.ghf.ts', 'ghf.ts', '.ghf.json', 'ghf.json', '.ghf.js', 'ghf.js', '.ghf.yaml', 'ghf.yaml', '.ghf.yml', 'ghf.yml']

  for (const file of files) {
    if (await fileExists(file)) {
      return file
    }
  }

  throw new Error('No settings file found')
}

export const loadSettings = async (filepath: string) => {
  const isRemote = filepath.startsWith('https://')

  const content = isRemote ? await (await fetch(filepath)).text() : await Deno.readTextFile(filepath === '' ? await findSettingsFile() : filepath)

  const extension = filepath.split('.').pop()

  const data = await parse(content, extension ?? '')

  const settings = settingsSchema.parse(data)

  const presetEntries = Object.entries(settings.presets ?? {})

  for (const [_, rules] of presetEntries) {
    for (const rule of rules) {
      if (rule.type === 'preset') {
        throw new Error('Presets cannot contain other presets')
      }
    }
  }

  if (isRemote) {
    const remote = filepath.substring(0, filepath.lastIndexOf('/'))
    setupRemoteRules(settings, remote)
  }

  if (settings.extends?.length) {
    for (const extend of settings.extends) {
      const extendedSettings = await loadSettings(extend)
      settings.presets = { ...extendedSettings.presets, ...settings.presets }
      settings.rules?.push(...(extendedSettings.rules ?? []))
    }
  }

  return settings
}

const setupRemoteRules = (settings: Settings, remote: string) => {
  for (const rule of settings.rules ?? []) {
    updateRuleWithRemote(rule, remote)
  }

  for (const preset of Object.values(settings.presets ?? {})) {
    for (const rule of preset) {
      updateRuleWithRemote(rule, remote)
    }
  }

  settings.extends = settings.extends?.map(extend => (extend.startsWith('https://') ? extend : normalizeUrl(`${remote}/${extend}`))) ?? []
}

const updateRuleWithRemote = (rule: Rule, remote: string) => {
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
    case 'part':
      rule.content = replacePathWithRemote(rule.content, remote)
      break
  }
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
