import { z } from '../deps.ts'
import type { Settings } from '../settings.ts'
import { ruleFileFunc, ruleFileSchema } from './file.ts'
import { rulePresetFunc, rulePresetSchema } from './preset.ts'

export const ruleSchema = z.discriminatedUnion('type', [ruleFileSchema, rulePresetSchema])

type Rule = z.infer<typeof ruleSchema>
type RuleType = Rule['type']
type ExtractRule<T extends RuleType> = Extract<Rule, { type: T }>
type RuleFunc<T extends RuleType> = (rule: ExtractRule<T>) => Promise<void>

const ruleFuncs = {
  file: ruleFileFunc,
  preset: rulePresetFunc,
} satisfies { [key in RuleType]: RuleFunc<key> }

export const planRules = async (settings: Settings) => {
  for (const rule of settings.rules) {
    await planRule(rule)
  }
}

function planRule<T extends RuleType>(rule: ExtractRule<T>) {
  const ruleFunc = ruleFuncs[rule.type]

  if (!ruleFunc) {
    throw new Error(`Unsupported rule type: ${rule.type}`)
  }

  return (ruleFunc as RuleFunc<T>)(rule)
}
