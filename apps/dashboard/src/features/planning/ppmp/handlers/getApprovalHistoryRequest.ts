import {
    PaginationResponse,
    QueryBlueprintFromTemplate,
    QueryKey,
    QueryParams,
} from 'erpez-shared-lib'

import api from '@/services/api'
import { PPMPApprovalHistory } from '../types'

const endpoint = '/ppmps/:id/approval-history'

export const getApprovalHistoryRequest: QueryBlueprintFromTemplate<
    typeof endpoint,
    PaginationResponse<PPMPApprovalHistory>,
    QueryParams,
    QueryKey
> = {
    endpoint,
    key: ({ url }) => [url],
    fetcher: async ({ finalUrl, signal }) => {
        const response = await api.get<PaginationResponse<PPMPApprovalHistory>>(finalUrl, {
            signal,
        })
        return response.data
    },
}
