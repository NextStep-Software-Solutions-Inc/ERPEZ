import type { QueryBlueprintFromTemplate, QueryKey } from "erpez-shared-lib";
import type { KPIPerformanceMeasure } from "../types";
import type {
    PaginationResponse,
    QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from "@/services/api"

const endpoint = '/kpi-performance-measures'

export const getKPIPerformanceMeasuresRequest: QueryBlueprintFromTemplate<
    typeof endpoint,
    PaginationResponse<KPIPerformanceMeasure>,
    QueryParams,
    QueryKey> = {
    endpoint,
    key: ({ url }) => [url],
    fetcher: async ({ finalUrl, signal }) => {
        const response = await api.get<PaginationResponse<KPIPerformanceMeasure>>(finalUrl, {
            signal,
        })
        return response.data
    },
}