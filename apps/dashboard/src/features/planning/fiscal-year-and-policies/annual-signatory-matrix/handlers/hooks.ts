import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { createWorkflowMatrixRequest } from './createWorkflowMatrixRequest'
import { deleteWorkflowMatrixRequest } from './deleteWorkflowMatrixRequest'
import { getWorkflowMatrixRequest } from './getWorkflowMatrixRequest'
import { getWorkflowMatricesRequest } from './getWorkflowMatricesRequest'
import { patchWorkflowMatrixRequest } from './patchWorkflowMatrixRequest'
import { resolveApproversRequest } from './resolveApproversRequest'
import { updateWorkflowMatrixRequest } from './updateWorkflowMatrixRequest'

export const useWorkflowMatrices = createQueryHookFromTemplate(
  getWorkflowMatricesRequest,
)

export const useWorkflowMatrix = createQueryHookFromTemplate(
  getWorkflowMatrixRequest,
)

export const useCreateWorkflowMatrix = createMutationHookFromTemplate(
  createWorkflowMatrixRequest,
)

export const useUpdateWorkflowMatrix = createMutationHookFromTemplate(
  updateWorkflowMatrixRequest,
)

export const usePatchWorkflowMatrix = createMutationHookFromTemplate(
  patchWorkflowMatrixRequest,
)

export const useDeleteWorkflowMatrix = createMutationHookFromTemplate(
  deleteWorkflowMatrixRequest,
)

export const useResolveApprovers = createMutationHookFromTemplate(
  resolveApproversRequest,
)
