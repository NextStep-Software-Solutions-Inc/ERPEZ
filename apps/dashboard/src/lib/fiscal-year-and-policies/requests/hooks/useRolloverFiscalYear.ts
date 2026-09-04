import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { rolloverFiscalYearRequest } from '../rolloverFiscalYearRequest'

/**
 * Hook for executing a fiscal year data rollover
 *
 * Usage:
 * const { mutateAsync, isPending } = useRolloverFiscalYear()
 * await mutateAsync({
 *   pathParams: { id: targetYearId },
 *   payload: {
 *     sourceFiscalYearId: sourceYearId,
 *     includeOrgStructure: true,
 *     includeUACSLibrary: true,
 *     includeRecurringExpenses: false,
 *   }
 * })
 */
export const useRolloverFiscalYear = createMutationHookFromTemplate(
  rolloverFiscalYearRequest,
)
