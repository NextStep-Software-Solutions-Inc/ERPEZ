/**
 * React Query hook for fetching PSDBM depots
 * Uses the factory pattern from erpez-shared-lib
 */

import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getPSDBMDepotsRequest } from '../handlers'

export const usePSDBMDepots = createQueryHookFromTemplate(getPSDBMDepotsRequest)

