/**
 * Hook for Deleting Market Scoping Forms
 * Location: src/features/planning/market-scoping/hooks/
 * 
 * Provides mutation hook for deleting market scoping records
 */

import { createMutationHookFromTemplate } from "erpez-shared-lib";
import { deleteMarketScopingRequest } from "../handlers/deleteMarketScopingRequest";

export const useDeleteMarketScoping = createMutationHookFromTemplate(
  deleteMarketScopingRequest
);
