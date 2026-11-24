/**
 * React Query hook for fetching PSDBM categories
 * Uses the factory pattern from erpez-shared-lib
 */

import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getPSDBMCategoriesRequest } from '../handlers'

export const usePSDBMCategories = createQueryHookFromTemplate(getPSDBMCategoriesRequest)

