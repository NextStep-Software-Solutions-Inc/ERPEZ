import {
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { getOfficeCeilingsRequest } from '../handlers/getOfficeCeilingsRequest'

/**
 * Hook for fetching office ceilings (used in LIB flow selector - top-down mode)
 *
 * Usage:
 * const { data, isLoading } = useOfficeCeilings({
 *   pathParams: {},
 *   queryParams: { filters: `officeId=={officeId},fiscalYearId=={fiscalYearId}` }
 * })
 */
export const useOfficeCeilings = createQueryHookFromTemplate(
  getOfficeCeilingsRequest,
)
