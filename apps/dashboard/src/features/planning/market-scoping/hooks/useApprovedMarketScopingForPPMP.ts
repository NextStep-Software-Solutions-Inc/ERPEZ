/**
 * Hook for PPMP Module - Get Approved Market Scoping Records
 * Location: src/features/planning/market-scoping/hooks/
 *
 * ACCEPTANCE CRITERIA: Item #6
 * Provides PPMP Builder module with list of approved market scoping records
 * to use as prerequisites for new PPMP line items.
 *
 * Usage in PPMP Module:
 * ```tsx
 * const { data: prerequisiteRecords } = useApprovedMarketScopingForPPMP({
 *   pathParams: {},
 *   queryParams: { departmentUnit: "Finance" }
 * })
 * ```
 */

import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getApprovedForPPMPRequest } from '../handlers/getApprovedForPPMPRequest'

export const useApprovedMarketScopingForPPMP = createQueryHookFromTemplate(
  getApprovedForPPMPRequest,
)
