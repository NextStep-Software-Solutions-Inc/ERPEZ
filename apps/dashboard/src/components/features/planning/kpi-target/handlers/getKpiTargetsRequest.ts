import type { QueryBlueprintFromTemplate, QueryKey } from "erpez-shared-lib";
import type { KpiTarget } from "../types";
import type { PaginationResponse, QueryParams } from "erpez-shared-lib/dist/types/Blueprint";
import { api } from "@/services/api";

const endpoint = "/kpi-targets";

export const getKpiTargetsRequest: QueryBlueprintFromTemplate<
    typeof endpoint,
    PaginationResponse<KpiTarget>,
    QueryParams,
    QueryKey
> = {
    endpoint,
    key: ({ url }) => [url],
    fetcher: async ({ finalUrl, signal }) => {
        const response = await api.get<PaginationResponse<KpiTarget>>(finalUrl, {
            signal,
        });
        return response.data;
    },
};