/**
 * Get AOB By ID Request Handler
 * Alias for getAOBDetailRequest with query hook support
 */

import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getAOBDetailRequest } from './getAOBDetailRequest'

export const getAOBByIdRequest = getAOBDetailRequest
export const useGetAOBById = createQueryHookFromTemplate(getAOBByIdRequest)
