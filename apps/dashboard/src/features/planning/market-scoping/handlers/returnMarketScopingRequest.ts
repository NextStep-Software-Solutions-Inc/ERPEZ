/**
 * Return Market Scoping Handler
 * POST /market-scopings/:id/return
 * Location: src/features/planning/market-scoping/handlers/
 */

import type { MutationBlueprintFromTemplate, APIResponse } from "erpez-shared-lib";
import api from "@/services/api";
import type { MarketScopingForm } from "../types/marketScopingTypes";

const endpoint = "/market-scopings/:id/return" as const;

export interface ReturnMarketScopingPayload {
  remarks?: string;
}

export const returnMarketScopingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<MarketScopingForm>,
  undefined,
  ReturnMarketScopingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<MarketScopingForm>>(finalUrl, payload);
    return response.data;
  },
};
