/**
 * Hook for Creating Market Scoping Forms
 * Location: src/features/planning/market-scoping/hooks/
 * 
 * Provides mutation hook for creating new market scoping records
 * 
 * Usage:
 * ```tsx
 * const { mutate: createMarketScoping, isPending } = useCreateMarketScoping()
 * 
 * const handleSubmit = async (formData: MarketScopingForm) => {
 *   createMarketScoping({
 *     pathParams: {},
 *     payload: transformedPayload,
 *   })
 * }
 * ```
 */

import { createMutationHookFromTemplate } from "erpez-shared-lib";
import { createMarketScopingRequest } from "../handlers/createMarketScopingRequest";

export const useCreateMarketScoping = createMutationHookFromTemplate(
  createMarketScopingRequest
);
