import type {APIResponse, MutationBlueprintFromTemplate} from 'erpez-shared-lib';
import type { Rating } from '../types'
import { api } from '@/services/api'

const endpoint = '/ratings'

type CreateRatingPayload = {
    kpiId: string
    performanceMeasureId: string
    numericalRating: number
    remarks: string
}

export const createRatingRequest: MutationBlueprintFromTemplate<
    typeof endpoint,
    APIResponse<Rating>,
    undefined,
    CreateRatingPayload
> = {
    endpoint,
    fetcher: async ({ finalUrl, payload }) => {
        const res = await api.post<APIResponse<Rating>>(finalUrl, payload)
        return res.data
    },
}