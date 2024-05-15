type CreatePlan = {
  type: 'create'
  path: string
  content: string
}

type UpdatePlan = {
  type: 'update'
  path: string
  old: string
  new: string
}

type RemovePlan = {
  type: 'remove'
  path: string
}

export type Plan = CreatePlan | UpdatePlan | RemovePlan
