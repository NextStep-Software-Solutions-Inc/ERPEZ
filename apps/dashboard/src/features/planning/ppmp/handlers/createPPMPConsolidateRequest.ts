import type {
    APIResponse,
    MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { PPMP } from '../types'


const endpoint = '/ppmps/consolidate'

export type CreatePPMPConsolidatePaylod = {
    childPPMPIds?: string[]
    parentOfficeId: string
    fiscalYearId: string
    consolidatedPPMPNumber?: string
}

export const createPPMPConsolidateRequest: MutationBlueprintFromTemplate<
    typeof endpoint,
    APIResponse<PPMP>,
    undefined,
    CreatePPMPConsolidatePaylod
> = {
    endpoint,
    fetcher: async ({ finalUrl, payload }) => {
        const response = await api.post<APIResponse<PPMP>>(finalUrl, payload)
        return response.data
    },
}
