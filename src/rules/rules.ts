import { exists, z } from '../deps.ts'
import type { Settings } from '../settings.ts'
import { ruleFileFunc, ruleFileSchema } from './file.ts'
import { ruleLinesFunc, ruleLinesSchema } from './lines.ts'
import type { Plan } from '../plan.ts'
import { ruleResetFunc, ruleResetSchema } from './reset.ts'
import { FileSystem } from '../filesystem.ts'
import { ruleDeleteFunc, ruleDeleteSchema } from './delete.ts'
import { ruleInitFunc, ruleInitSchema } from './init.ts'

const rulePresetSchema = z.object({
  type: z.literal('preset'),
  name: z.string(),
})

type PresetRule = z.infer<typeof rulePresetSchema>

const rulePresetFunc = async ({ name }: PresetRule, fs: FileSystem, settings: Settings) => {
  const preset = settings.presets[name]

  if (!preset) {
    throw new Error(`Preset not found: ${name}`)
  }

  for (const rule of preset) {
    if (rule.type === 'preset') {
      throw new Error('Presets cannot contain other presets')
    }

    await applyRule(rule, fs, settings)
  }
}

export const ruleSchema = z.discriminatedUnion('type', [ruleFileSchema, rulePresetSchema, ruleLinesSchema, ruleResetSchema, ruleDeleteSchema, ruleInitSchema])

type Rule = z.infer<typeof ruleSchema>
type RuleType = Rule['type']
type ExtractRule<T extends RuleType> = Extract<Rule, { type: T }>
type RuleFunc<T extends RuleType> = (rule: ExtractRule<T>, fileSystem: FileSystem, settings: Settings) => Promise<void> | void

const ruleFuncs = {
  file: ruleFileFunc,
  lines: ruleLinesFunc,
  reset: ruleResetFunc,
  delete: ruleDeleteFunc,
  preset: rulePresetFunc,
  init: ruleInitFunc,
} satisfies { [key in RuleType]: RuleFunc<key> }

export const planRules = async (settings: Settings): Promise<Plan[]> => {
  const plans: Plan[] = []
  const fileSystem = FileSystem()

  for (const rule of settings.rules) {
    await applyRule(rule, fileSystem, settings)
  }

  const fileEntries = await fileSystem.entries()

  for (const [path, content] of fileEntries) {
    if (content === null) {
      plans.push({ type: 'remove', path })
      continue
    }

    if (!exists(path)) {
      plans.push({ type: 'create', path, content })
    }

    const old = await Deno.readTextFile(path)

    if (old !== content) {
      plans.push({ type: 'update', path, old, new: content })
    }
  }

  return plans
}

function applyRule<T extends RuleType>(rule: ExtractRule<T>, fileSystem: FileSystem, settings: Settings) {
  const ruleFunc = ruleFuncs[rule.type]

  if (!ruleFunc) {
    throw new Error(`Unsupported rule type: ${rule.type}`)
  }

  return (ruleFunc as RuleFunc<T>)(rule, fileSystem, settings)
}
