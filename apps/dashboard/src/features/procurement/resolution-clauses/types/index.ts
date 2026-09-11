export type ResolutionClauseType = 'Whereas' | 'NowTherefore' | 'Resolved'

export interface ResolutionClause {
  id: string
  name: string
  body: string
  clauseType: ResolutionClauseType
  createdAt?: string
  updatedAt?: string
}

export interface CreateResolutionClausePayload {
  name: string
  body: string
  clauseType?: ResolutionClauseType | string
}

export interface UpdateResolutionClausePayload {
  name?: string
  body?: string
  clauseType?: ResolutionClauseType | string
}
