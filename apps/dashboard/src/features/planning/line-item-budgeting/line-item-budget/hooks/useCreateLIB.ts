import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { createLIBRequest } from '../handlers/createLIBRequest'

/**
 * Hook for creating a new Line Item Budget (LIB)
 *
 * Usage:
 * const { mutateAsync, isPending } = useCreateLIB()
 * await mutateAsync({ pathParams: {}, payload: { fiscalYearId: 'fy-id', fundSourceId: 'fs-id' } })
 */
export const useCreateLIB = createMutationHookFromTemplate(createLIBRequest)
