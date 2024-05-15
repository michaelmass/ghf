import { exists, z } from '../deps.ts'
import type { Settings } from '../settings.ts'
import { ruleFileFunc, ruleFileSchema } from './file.ts'
import { rulePresetFunc, rulePresetSchema } from './preset.ts'
import { ruleLinesFunc, ruleLinesSchema } from './lines.ts'
import type { Plan } from '../plan.ts'
import { ruleResetFunc, ruleResetSchema } from './reset.ts'
import { FileSystem } from '../filesystem.ts'

export const ruleSchema = z.discriminatedUnion('type', [ruleFileSchema, rulePresetSchema, ruleLinesSchema, ruleResetSchema])

type Rule = z.infer<typeof ruleSchema>
type RuleType = Rule['type']
type ExtractRule<T extends RuleType> = Extract<Rule, { type: T }>
type RuleFunc<T extends RuleType> = (rule: ExtractRule<T>, fileSystem: FileSystem, settings: Settings) => Promise<void> | void

const ruleFuncs = {
  file: ruleFileFunc,
  preset: rulePresetFunc,
  lines: ruleLinesFunc,
  reset: ruleResetFunc,
} satisfies { [key in RuleType]: RuleFunc<key> }

export const planRules = async (settings: Settings): Promise<Plan[]> => {
  const plans: Plan[] = []
  const fileSystem = FileSystem()

  for (const rule of settings.rules) {
    await applyRule(rule, fileSystem, settings)
  }

  for (const [path, content] of fileSystem.entries()) {
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
