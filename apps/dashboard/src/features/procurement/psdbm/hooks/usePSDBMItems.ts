/**
 * React Query hook for fetching PSDBM items
 * Uses the factory pattern from erpez-shared-lib
 */

import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getPSDBMItemsRequest } from '../handlers'

export const usePSDBMItems = createQueryHookFromTemplate(getPSDBMItemsRequest)
