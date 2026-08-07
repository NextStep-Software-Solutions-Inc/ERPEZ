import type { QueryBlueprintFromTemplate, QueryKey } from "erpez-shared-lib";
import type { KpiTarget } from "../types";
import type { APIResponse, QueryParams } from "erpez-shared-lib/dist/types/Blueprint";
import { api } from "@/services/api";

const endpoint = "/kpi-targets/:id";

export const getKpiTargetRequest: QueryBlueprintFromTemplate<
    typeof endpoint,
    APIResponse<KpiTarget>,
    QueryParams,
    QueryKey
> = {
    endpoint,
    key: ({ url }) => [url],
    fetcher: async ({ finalUrl, signal }) => {
        const response = await api.get<APIResponse<KpiTarget>>(finalUrl, {
            signal,
        });
        return response.data;
    },
};
