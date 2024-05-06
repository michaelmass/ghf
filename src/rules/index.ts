import { z } from '../deps.ts'
import type { Settings } from '../settings.ts'
import { ruleFileFunc, ruleFileSchema } from './file.ts'
import { rulePresetFunc, rulePresetSchema } from './preset.ts'
import { ruleLinesFunc, ruleLinesSchema } from './lines.ts'
import type { Plan } from '../plan.ts'

export const ruleSchema = z.discriminatedUnion('type', [ruleFileSchema, rulePresetSchema, ruleLinesSchema])

type Rule = z.infer<typeof ruleSchema>
type RuleType = Rule['type']
type ExtractRule<T extends RuleType> = Extract<Rule, { type: T }>
type RuleFunc<T extends RuleType> = (rule: ExtractRule<T>, settings: Settings) => Promise<Plan[]>

const ruleFuncs = {
  file: ruleFileFunc,
  preset: rulePresetFunc,
  lines: ruleLinesFunc,
} satisfies { [key in RuleType]: RuleFunc<key> }

export const planRules = async (settings: Settings): Promise<Plan[]> => {
  const plans: Plan[] = []

  for (const rule of settings.rules) {
    plans.push(...(await planRule(rule, settings)))
  }

  return plans
}

function planRule<T extends RuleType>(rule: ExtractRule<T>, settings: Settings) {
  const ruleFunc = ruleFuncs[rule.type]

  if (!ruleFunc) {
    throw new Error(`Unsupported rule type: ${rule.type}`)
  }

  return (ruleFunc as RuleFunc<T>)(rule, settings)
}
