import type { CreateKpiAssignmentFormType } from '../../kpi-assignment-for-du/form/CreateDuKpiAssignmentForm'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/delivery-units/:id/assign-kpis'

type CreateDeliveryUnitAssignKpi = CreateKpiAssignmentFormType

export const createDeliveryUnitAssignKpiRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<CreateDeliveryUnitAssignKpi>,
  undefined,
  CreateDeliveryUnitAssignKpi
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<CreateDeliveryUnitAssignKpi>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
