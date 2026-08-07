/**
 * Approve Market Scoping Form
 * POST /market-scopings/:id/approve
 * Mutation handler - for department/agency heads
 */

import type { MutationBlueprintFromTemplate, APIResponse } from "erpez-shared-lib";
import api from "@/services/api";
import type { MarketScopingForm } from "../types/marketScopingTypes";

const endpoint = "/market-scopings/:id/approve" as const;

export interface ApproveMarketScopingPayload {
  signedDocumentFileId?: string;
  actionComments?: string;
}

export const approveMarketScopingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<MarketScopingForm>,
  undefined,
  ApproveMarketScopingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<MarketScopingForm>>(finalUrl, payload);
    return response.data;
  },
};
