import type {APIResponse, MutationBlueprintFromTemplate,
    QueryParams} from 'erpez-shared-lib';
import type { Rating } from '../types'
import { api } from '@/services/api'

const endpoint = '/ratings/:id'

type UpdateRatingPayload = {
    numericalRating: number
    remarks: string
}


export const updateRatingRequest: MutationBlueprintFromTemplate<
    typeof endpoint,
    APIResponse<Rating>,
    QueryParams,
    UpdateRatingPayload
> = {
    endpoint,
    fetcher: async ({ finalUrl, payload }) => {
        const response = await api.put<APIResponse<Rating>>(finalUrl, payload)
        return response.data
    },
}