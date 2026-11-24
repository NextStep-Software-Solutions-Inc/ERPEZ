import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getResolutionClausesRequest } from './getResolutionClausesRequest'
import { createResolutionClauseRequest } from './createResolutionClauseRequest'
import { updateResolutionClauseRequest } from './updateResolutionClauseRequest'
import { deleteResolutionClauseRequest } from './deleteResolutionClauseRequest'

export const useResolutionClauses = createQueryHookFromTemplate(getResolutionClausesRequest)
export const useCreateResolutionClause = createMutationHookFromTemplate(createResolutionClauseRequest)
export const useUpdateResolutionClause = createMutationHookFromTemplate(updateResolutionClauseRequest)
export const useDeleteResolutionClause = createMutationHookFromTemplate(deleteResolutionClauseRequest)
