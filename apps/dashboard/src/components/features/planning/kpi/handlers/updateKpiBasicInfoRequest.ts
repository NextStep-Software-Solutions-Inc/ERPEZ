import type { EditKpiBasicInfoSubmission } from './../form/EditKpiBasicInfoForm';
import type {
    APIResponse,
    MutationBlueprintFromTemplate, QueryParams 
} from 'erpez-shared-lib'
import type { KPI } from '../types'

import api from '@/services/api'

const endpoint = '/kpis/:id'
type UpdateKpiPayload = EditKpiBasicInfoSubmission
export const updateKpiBasicInfoRequest: MutationBlueprintFromTemplate<
    typeof endpoint,
    APIResponse<KPI>,
    QueryParams,
    UpdateKpiPayload
> = {
    endpoint,
    fetcher: async ({ finalUrl, payload }) => {
        const response = await api.put<APIResponse<KPI>>(finalUrl, payload)
        return response.data
    },
}
