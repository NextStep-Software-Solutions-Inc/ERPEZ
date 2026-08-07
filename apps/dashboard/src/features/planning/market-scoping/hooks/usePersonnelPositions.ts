/**
 * Use Personnel Positions Query Hook
 * Fetches list of personnel for selection
 * Location: src/features/planning/market-scoping/hooks/
 */

import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getPersonnelPositionsRequest } from '../handlers/getPersonnelPositionsRequest'

export const usePersonnelPositions = createQueryHookFromTemplate(getPersonnelPositionsRequest)
