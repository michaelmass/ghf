import { z } from './deps.ts'
import { fileExists } from './fs.ts'
import { parse } from './parse.ts'
import { type Rule, ruleSchema } from './rules/index.ts'
import type { Content } from './schemas.ts'
import { fetchText, normalizeUrl } from './url.ts'

export const settingsSchema = z.object({
  $schema: z.string().optional(),
  extends: z.string().array().optional(),
  presets: z.record(z.string(), ruleSchema.array()).optional(),
  rules: ruleSchema.array().optional(),
})

export type Settings = z.infer<typeof settingsSchema>

const SETTINGS_FILES = ['.ghf.ts', 'ghf.ts', '.ghf.json', 'ghf.json', '.ghf.js', 'ghf.js', '.ghf.yaml', 'ghf.yaml', '.ghf.yml', 'ghf.yml']

export const REGISTRIES: Record<string, string> = {
  '@ghf': 'https://michaelmass.github.io/ghf/ghf',
}

export const resolveRegistry = (path: string): string => {
  if (!path.startsWith('@')) return path
  const slash = path.indexOf('/')
  const name = slash === -1 ? path : path.slice(0, slash)
  const rest = slash === -1 ? '' : path.slice(slash)
  const base = REGISTRIES[name]
  if (!base) {
    const known = Object.keys(REGISTRIES).join(', ')
    throw new Error(`Unknown registry "${name}" in "${path}". Known registries: ${known}`)
  }
  return `${base}${rest}`
}

const findSettingsFile = async () => {
  for (const file of SETTINGS_FILES) {
    if (await fileExists(file)) {
      return file
    }
  }

  throw new Error(`No settings file found in the current directory. Looked for: ${SETTINGS_FILES.join(', ')}. Run \`ghf init\` to create one, or pass --config <path|url>.`)
}

const formatZodError = (error: z.ZodError): string => {
  return error.issues
    .map(issue => {
      const path = issue.path.length ? issue.path.join('.') : '<root>'
      return `  - ${path}: ${issue.message}`
    })
    .join('\n')
}

type LoadContext = {
  cache: Map<string, Settings>
  visiting: Set<string>
}

export const loadSettings = (path: string): Promise<Settings> => {
  return loadSettingsInternal(path, { cache: new Map(), visiting: new Set() })
}

const loadSettingsInternal = async (path: string, ctx: LoadContext): Promise<Settings> => {
  const filepath = path === '' ? await findSettingsFile() : resolveRegistry(path)

  const cached = ctx.cache.get(filepath)
  if (cached) {
    return cached
  }

  if (ctx.visiting.has(filepath)) {
    const chain = [...ctx.visiting, filepath].join(' -> ')
    throw new Error(`Cyclic extends detected: ${chain}`)
  }

  ctx.visiting.add(filepath)

  try {
    const isRemote = filepath.startsWith('https://')

    const content = isRemote ? await fetchText(filepath, 'settings') : await Deno.readTextFile(filepath)

    const extension = filepath.split('.').pop() ?? ''

    let data: unknown

    try {
      data = await parse(content, extension)
    } catch (cause) {
      throw new Error(`Failed to parse settings from ${filepath} as ${extension}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause })
    }

    const result = settingsSchema.safeParse(data)

    if (!result.success) {
      throw new Error(`Invalid settings in ${filepath}:\n${formatZodError(result.error)}`, { cause: result.error })
    }

    const settings = result.data

    if (!settings.rules) {
      settings.rules = []
    }

    if (!settings.presets) {
      settings.presets = {}
    }

    if (!settings.extends) {
      settings.extends = []
    }

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
        const extendedSettings = await loadSettingsInternal(extend, ctx)
        settings.presets = { ...extendedSettings.presets, ...settings.presets }
        settings.rules?.unshift(...(extendedSettings.rules ?? []))
      }
    }

    ctx.cache.set(filepath, settings)
    return settings
  } finally {
    ctx.visiting.delete(filepath)
  }
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

  settings.extends =
    settings.extends?.map(extend => {
      const resolved = resolveRegistry(extend)
      return resolved.startsWith('https://') ? resolved : normalizeUrl(`${remote}/${resolved}`)
    }) ?? []
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
