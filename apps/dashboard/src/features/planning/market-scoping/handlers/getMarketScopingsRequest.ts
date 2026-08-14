/**
 * Get all Market Scoping Forms for current user
 * Query handler using factory pattern
 * Location: src/features/planning/market-scoping/handlers/
 */

import type { QueryBlueprintFromTemplate, QueryKey, QueryParams, APIResponse } from "erpez-shared-lib";
import type { ListMarketScopingResponse } from "../types/marketScopingApiTypes";
import api from "@/services/api";

const endpoint = "/market-scopings" as const;

interface GetMarketScopingsParams extends QueryParams {
  pageNumber?: number;
  pageSize?: number;
  filters?: string;
  sorts?: string;
}

export const getMarketScopingsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ListMarketScopingResponse>,
  GetMarketScopingsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ListMarketScopingResponse>>(finalUrl, { signal });
    return response.data;
  },
};
