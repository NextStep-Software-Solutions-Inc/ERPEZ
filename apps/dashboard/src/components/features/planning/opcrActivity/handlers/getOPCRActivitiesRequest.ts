/**
 * getOPCRActivitiesRequest Handler
 * Fetches paginated list of OPCR Activities
 * Follows Request Blueprint Pattern from erpez-shared-lib
 */
import type {
    QueryBlueprintFromTemplate,
    QueryKey,
} from 'erpez-shared-lib'
import type {
    QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import type { OPCRActivitiesResponse } from '../types'
import api from '@/services/api'

/** API endpoint for fetching OPCR Activities */
const endpoint = '/opcr-activities'

/**
 * Query blueprint for fetching OPCR Activities with pagination and filtering
 * Supports pageNumber, pageSize, and filters query parameters
 */
export const getOPCRActivitiesRequest: QueryBlueprintFromTemplate<
    typeof endpoint,
    OPCRActivitiesResponse,
    QueryParams,
    QueryKey
> = {
    endpoint,
    key: ({ url }) => [url] as const,
    fetcher: async ({ finalUrl, signal }) => {
        const response = await api.get<OPCRActivitiesResponse>(finalUrl, {
            signal,
        })
        return response.data
    },
}
