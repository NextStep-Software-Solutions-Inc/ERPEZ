import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import {
  getEconomicIndicatorsRequest,
  getEconomicIndicatorByIdRequest,
} from './getEconomicIndicatorsRequest'
import { createEconomicIndicatorRequest } from './createEconomicIndicatorRequest'
import { updateEconomicIndicatorRequest } from './updateEconomicIndicatorRequest'
import { deleteEconomicIndicatorRequest } from './deleteEconomicIndicatorRequest'

export const useEconomicIndicators = createQueryHookFromTemplate(
  getEconomicIndicatorsRequest,
)
export const useEconomicIndicatorById = createQueryHookFromTemplate(
  getEconomicIndicatorByIdRequest,
)
export const useCreateEconomicIndicator = createMutationHookFromTemplate(
  createEconomicIndicatorRequest,
)
export const useUpdateEconomicIndicator = createMutationHookFromTemplate(
  updateEconomicIndicatorRequest,
)
export const useDeleteEconomicIndicator = createMutationHookFromTemplate(
  deleteEconomicIndicatorRequest,
)
