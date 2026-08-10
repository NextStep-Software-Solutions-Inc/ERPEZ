import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { linkCeilingToLIBRequest } from '../handlers/linkCeilingToLIBRequest'

/**
 * Hook for linking a ceiling (AgencyMasterBudget) to a Proposed/PendingCeilingApproval LIB
 *
 * Usage:
 * const { mutateAsync, isPending } = useLinkCeilingToLIB()
 * await mutateAsync({
 *   pathParams: { id: libId },
 *   payload: { agencyMasterBudgetId: 'amb-guid' }
 * })
 *
 * On success: backend transitions LIB status to "Draft"
 */
export const useLinkCeilingToLIB = createMutationHookFromTemplate(
  linkCeilingToLIBRequest,
)
