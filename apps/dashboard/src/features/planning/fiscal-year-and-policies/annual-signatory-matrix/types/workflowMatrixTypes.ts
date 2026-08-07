export type WorkflowMatrixPosition = {
  id: string
  title: string
  code: string
}

export type WorkflowMatrixUser = {
  id: string
  name: string
  email: string
}

export type WorkflowMatrixApprover = {
  position: WorkflowMatrixPosition
  currentUser: WorkflowMatrixUser
}

export type WorkflowMatrix = {
  id: string
  fiscalYearId: string
  fiscalYear: number
  officeId: string
  officeName: string
  documentType?: string
  status: string
  recommendingApprover: WorkflowMatrixApprover
  finalApprover: WorkflowMatrixApprover
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export type CreateWorkflowMatrixPayload = {
  officeId: string
  fiscalYearId: string
  recommendingApproverUserId: string
  finalApproverUserId: string
  documentType: string
}

export type CreateWorkflowMatrixRequestPayload = {
  officeId: string
  fiscalYearId: string
  recommendingApproverPositionId: string
  finalApproverPositionId: string
  documentType: string
}

export type ResolveApproversPayload = {
  officeId: string
  recommendingApproverUserId: string
  finalApproverUserId: string
}

export type ResolveApproversResponse = {
  recommendingApproverPositionId: string
  finalApproverPositionId: string
}

export type UpdateWorkflowMatrixPayload = {
  documentType: string
  recommendingApproverPositionId?: string | null
  finalApproverPositionId?: string | null
}

export type PatchWorkflowMatrixPayload = {
  status: string
}
