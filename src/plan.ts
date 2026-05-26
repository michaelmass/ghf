import { diff } from './deps.ts'
import { removeIfExists, writeTextFile } from './fs.ts'
import { log } from './logger.ts'

type CreatePlan = {
  type: 'create'
  path: string
  content: string
}

type UpdatePlan = {
  type: 'update'
  path: string
  old?: string
  new: string
}

type RemovePlan = {
  type: 'remove'
  path: string
}

export type Plan = CreatePlan | UpdatePlan | RemovePlan

type ApplyPlanOptions = {
  dryRun?: boolean
}

export async function applyPlans(plans: Plan[], opts: ApplyPlanOptions) {
  const action = opts.dryRun ? 'dry-run' : 'done'

  if (plans.length === 0) {
    log.positive(action, 'no changes')
    return
  }

  for (const plan of plans) {
    await applyPlan(plan, opts)
  }

  const counts: Record<Plan['type'], number> = { create: 0, update: 0, remove: 0 }

  for (const plan of plans) {
    counts[plan.type] += 1
  }

  const summary = `${counts.create} created, ${counts.update} updated, ${counts.remove} removed`
  log.positive(action, summary)
}

export async function applyPlan(plan: Plan, opts: ApplyPlanOptions) {
  const verb = opts.dryRun ? `would ${plan.type}` : plan.type

  switch (plan.type) {
    case 'create':
      if (!opts.dryRun) {
        await writeTextFile(plan.path, plan.content)
      }
      log.positive(verb, 'file', plan.path)
      break
    case 'update':
      if (!opts.dryRun) {
        await writeTextFile(plan.path, plan.new)
      }
      log.neutral(verb, 'file', plan.path)
      logDiff(plan.old ?? '', plan.new)
      break
    case 'remove':
      if (!opts.dryRun) {
        await removeIfExists(plan.path)
      }
      log.error(verb, 'file', plan.path)
      break
  }
}

const logDiff = (oldContent: string, newContent: string) => {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  const parts = diff(oldLines, newLines)

  let added = 0
  let removed = 0

  for (const part of parts) {
    switch (part.type) {
      case 'added':
        log.positive('+', part.value)
        added += 1
        break
      case 'removed':
        log.error('-', part.value)
        removed += 1
        break
    }
  }

  if (added + removed > 0) {
    log.debug('diff', `${added} added, ${removed} removed`)
  }
}
