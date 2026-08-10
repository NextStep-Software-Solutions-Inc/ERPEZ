import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getFunctionConfigsRequest } from './getFunctionConfigsRequest'
import { createFunctionConfigRequest } from './createFunctionConfigRequest'
import {
  updateFunctionConfigRequest,
  deleteFunctionConfigRequest,
} from './saveFunctionConfigsRequest'
import { getFunctionConfigByIdRequest } from './getFunctionConfigRequest'

export const useFunctionConfigs = createQueryHookFromTemplate(
  getFunctionConfigsRequest,
)
export const useFunctionConfigById = createQueryHookFromTemplate(
  getFunctionConfigByIdRequest,
)
export const useCreateFunctionConfig = createMutationHookFromTemplate(
  createFunctionConfigRequest,
)
export const useUpdateFunctionConfig = createMutationHookFromTemplate(
  updateFunctionConfigRequest,
)
export const useDeleteFunctionConfig = createMutationHookFromTemplate(
  deleteFunctionConfigRequest,
)
