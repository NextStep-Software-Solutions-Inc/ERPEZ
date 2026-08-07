import type {
    APIResponse,
    MutationBlueprintFromTemplate,
    QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/opcrs/:id/rating/submit'

export type SubmitOPCRRatingPayload = {
    comments?: string | null
}

export const submitOPCRRatingRequest: MutationBlueprintFromTemplate<
    typeof endpoint,
    APIResponse<boolean>,
    QueryParams,
    SubmitOPCRRatingPayload
> = {
    endpoint,
    fetcher: async ({ finalUrl, payload }) => {
        const response = await api.post<APIResponse<boolean>>(finalUrl, payload)
        return response.data
    },
}
