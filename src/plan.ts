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

const planCreate = (path: string, content: string): CreatePlan => ({
  type: 'create',
  path,
  content,
})

const planUpdate = (path: string, oldContent: string, newContent: string): UpdatePlan => ({
  type: 'update',
  path,
  old: oldContent,
  new: newContent,
})

const planRemove = (path: string): RemovePlan => ({
  type: 'remove',
  path,
})

export const plan = {
  create: planCreate,
  update: planUpdate,
  remove: planRemove,
}
