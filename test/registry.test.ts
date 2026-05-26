import { assert } from 'jsr:@std/assert'
import { dirname, fromFileUrl, join, resolve } from 'jsr:@std/path@1.1.0'
import type { Rule } from '../src/rules/index.ts'
import { type Settings, settingsSchema } from '../src/settings.ts'

const registryDir = fromFileUrl(new URL('../registry/', import.meta.url))
const ghfDir = join(registryDir, 'ghf')
const rootConfig = join(registryDir, 'ghf.json')

const parseSettingsFile = async (filepath: string): Promise<Settings> => {
  const content = await Deno.readTextFile(filepath)
  return settingsSchema.parse(JSON.parse(content))
}

type PresetEntry = { rules: Rule[]; sourceDir: string; source: string }
type PresetMap = Record<string, PresetEntry>

const collectPresets = async (filepath: string, seen = new Set<string>()): Promise<PresetMap> => {
  const absPath = resolve(filepath)

  if (seen.has(absPath)) {
    return {}
  }

  seen.add(absPath)

  const settings = await parseSettingsFile(absPath)
  const dir = dirname(absPath)

  const presets: PresetMap = {}

  for (const ext of settings.extends ?? []) {
    if (ext.startsWith('https://')) {
      continue
    }

    const extPath = resolve(dir, ext)
    const extPresets = await collectPresets(extPath, seen)

    for (const [name, entry] of Object.entries(extPresets)) {
      presets[name] = entry
    }
  }

  for (const [name, rules] of Object.entries(settings.presets ?? {})) {
    presets[name] = { rules, sourceDir: dir, source: absPath }
  }

  return presets
}

const getContentPath = (rule: Rule): string | null => {
  if (rule.type === 'preset' || rule.type === 'reset' || rule.type === 'delete') {
    return null
  }

  const content = rule.content

  if (typeof content === 'string') {
    return null
  }

  if ('url' in content) {
    return null
  }

  return content.path
}

const assertFileExists = async (path: string, context: string) => {
  const stat = await Deno.stat(path).catch(() => null)
  assert(stat?.isFile, `${context}: expected file at ${path}`)
}

const listConfigs = async (dir: string): Promise<string[]> => {
  const files: string[] = []

  for await (const entry of Deno.readDir(dir)) {
    if (entry.isFile && entry.name.endsWith('.json')) {
      files.push(join(dir, entry.name))
    }
  }

  files.sort()

  return files
}

const configFiles = await listConfigs(ghfDir)

Deno.test('registry/ghf.json: parses against settings schema', async () => {
  await parseSettingsFile(rootConfig)
})

Deno.test('registry/ghf.json: all preset content paths exist', async () => {
  const settings = await parseSettingsFile(rootConfig)
  const dir = dirname(rootConfig)

  for (const [name, rules] of Object.entries(settings.presets ?? {})) {
    for (const rule of rules) {
      const contentPath = getContentPath(rule)

      if (contentPath === null) {
        continue
      }

      await assertFileExists(resolve(dir, contentPath), `preset "${name}" rule type "${rule.type}"`)
    }
  }
})

for (const filepath of configFiles) {
  const label = filepath.slice(registryDir.length)

  Deno.test(`${label}: parses against settings schema`, async () => {
    await parseSettingsFile(filepath)
  })

  Deno.test(`${label}: preset references resolve in extended configs`, async () => {
    const settings = await parseSettingsFile(filepath)
    const presets = await collectPresets(filepath)

    for (const rule of settings.rules ?? []) {
      if (rule.type !== 'preset') {
        continue
      }

      assert(presets[rule.name], `preset "${rule.name}" referenced by ${label} is not defined in any extended config`)
    }
  })

  Deno.test(`${label}: referenced preset content paths exist on disk`, async () => {
    const settings = await parseSettingsFile(filepath)
    const presets = await collectPresets(filepath)

    for (const rule of settings.rules ?? []) {
      if (rule.type !== 'preset') {
        continue
      }

      const entry = presets[rule.name]

      if (!entry) {
        continue
      }

      for (const subrule of entry.rules) {
        const contentPath = getContentPath(subrule)

        if (contentPath === null) {
          continue
        }

        await assertFileExists(resolve(entry.sourceDir, contentPath), `${label} -> preset "${rule.name}" rule type "${subrule.type}"`)
      }
    }
  })
}
