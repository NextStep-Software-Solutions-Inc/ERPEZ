/**
 * Create new Market Scoping Form
 * Mutation handler for creating new market scoping records
 * POST /market-scopings
 * 
 * References:
 * - erpez-swagger.json: /market-scopings POST endpoint
 */

import type { MutationBlueprintFromTemplate, APIResponse } from "erpez-shared-lib";
import type { CreateMarketScopingRequest as CreatePayload } from "../types/marketScopingApiTypes";
import api from "@/services/api";

const endpoint = "/market-scopings" as const;

export const createMarketScopingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  CreatePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(
      finalUrl,
      payload
    );
    return response.data;
  },
};
