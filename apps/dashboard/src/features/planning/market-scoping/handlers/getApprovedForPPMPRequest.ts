/**
 * Get Approved Market Scoping Records for PPMP Module
 * Query handler - exposes approved market-scoping records to PPMP Builder
 * Location: src/features/planning/market-scoping/handlers/
 *
 * ACCEPTANCE CRITERIA: Item #6
 * Once approved, record's id, project_name, and estimated_budget are strictly 
 * exposed to the PPMP Builder module to be selected as a prerequisite for new PPMP line items.
 */

import type { QueryBlueprintFromTemplate, QueryKey, QueryParams, APIResponse } from "erpez-shared-lib";
import api from "@/services/api";

const endpoint = "/market-scopings/approved/for-ppmp" as const;

interface PPMPMarketScopingPrerequisite {
  readonly id: string;
  readonly project_name: string;
  readonly estimated_budget: number;
}

interface GetApprovedForPPMPParams extends QueryParams {
  departmentUnit?: string;
  agencyId?: string;
}

export const getApprovedForPPMPRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMPMarketScopingPrerequisite[]>,
  GetApprovedForPPMPParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<PPMPMarketScopingPrerequisite[]>>(finalUrl, { signal });
    return response.data;
  },
};

export type { PPMPMarketScopingPrerequisite, GetApprovedForPPMPParams };
