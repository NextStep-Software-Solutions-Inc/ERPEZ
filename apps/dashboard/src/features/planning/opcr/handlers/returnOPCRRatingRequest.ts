import type {
    APIResponse,
    MutationBlueprintFromTemplate,
    QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/opcrs/:id/rating/return'

export type ReturnOPCRRatingPayload = {
    comments?: string | null
}

export const returnOPCRRatingRequest: MutationBlueprintFromTemplate<
    typeof endpoint,
    APIResponse<boolean>,
    QueryParams,
    ReturnOPCRRatingPayload
> = {
    endpoint,
    fetcher: async ({ finalUrl, payload }) => {
        const response = await api.post<APIResponse<boolean>>(finalUrl, payload)
        return response.data
    },
}
