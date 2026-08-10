/**
 * updateSubKpiRequest Handler
 * Updates an existing SubKPI
 * Follows Request Blueprint Pattern from erpez-shared-lib
 * Payload aligned with CreateKpiFormValues from CreateKpiForm
 */
import type {
    APIResponse,
    MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { KPI } from '../../types'
import type { CreateKpiFormType } from '../../form/CreateKpiForm'
import api from '@/services/api'

/** API endpoint for updating SubKPIs */
const endpoint = '/kpis/:id'

/** Payload type for updating a SubKPI - aligned with CreateKpiFormType */
export type UpdateSubKPIPayload = CreateKpiFormType

/**
 * Mutation blueprint for updating a SubKPI
 * Uses KPI ID in the path to identify the SubKPI to update
 */
export const updateSubKpiRequest: MutationBlueprintFromTemplate<
    typeof endpoint,
    APIResponse<KPI>,
    undefined,
    UpdateSubKPIPayload
> = {
    endpoint,
    fetcher: async ({ finalUrl, payload }) => {
        const response = await api.put<APIResponse<KPI>>(finalUrl, payload)
        return response.data
    },
}
