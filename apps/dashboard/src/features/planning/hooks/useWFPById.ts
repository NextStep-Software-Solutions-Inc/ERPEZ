/**
 * React Query hook for fetching a single WFP by ID
 * Uses the factory pattern from erpez-shared-lib
 */

import { createQueryHookFromTemplate } from "erpez-shared-lib"
import { getWFPByIdRequest } from "~/features/planning/handlers/getWFPByIdRequest"

export const useWFPById = createQueryHookFromTemplate(getWFPByIdRequest)
