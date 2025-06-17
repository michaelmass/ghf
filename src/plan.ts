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
  for (const plan of plans) {
    await applyPlan(plan, opts)
  }
}

export async function applyPlan(plan: Plan, opts: ApplyPlanOptions) {
  if (opts.dryRun) {
    return
  }

  switch (plan.type) {
    case 'create':
      await Deno.writeTextFile(plan.path, plan.content)
      break
    case 'update':
      await Deno.writeTextFile(plan.path, plan.new)
      break
    case 'remove':
      await Deno.remove(plan.path)
      break
  }
}
