/**
 * Reject Market Scoping Form
 * Mutation handler - for department/agency heads
 */

import type { MutationBlueprintFromTemplate, APIResponse } from "erpez-shared-lib";
import type { MarketScopingForm } from "../types/marketScopingTypes";
import api from "@/services/api";

const endpoint = "/market-scopings/:id/reject" as const;

export interface RejectMarketScopingPayload {
  rejectionReason: string;
  actionComments?: string;
}

export const rejectMarketScopingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<MarketScopingForm>,
  undefined,
  RejectMarketScopingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<MarketScopingForm>>(
      finalUrl,
      payload
    );
    return response.data;
  },
};
