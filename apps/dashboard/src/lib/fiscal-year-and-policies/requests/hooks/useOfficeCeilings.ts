import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib';
import { getOfficeCeilingsRequest } from '../getOfficeCeilingsRequest';
import { getOfficeCeilingRequest } from '../getOfficeCeilingRequest';
import { createOfficeCeilingRequest } from '../createOfficeCeilingRequest';
import { updateOfficeCeilingRequest } from '../updateOfficeCeilingRequest';
import { deleteOfficeCeilingRequest } from '../deleteOfficeCeilingRequest';

/**
 * Hook for fetching all office ceilings
 *
 * Usage:
 * const { data, isLoading } = useOfficeCeilings({
 *   pathParams: {},
 *   queryParams: {}
 * })
 */
export const useOfficeCeilings = createQueryHookFromTemplate(
  getOfficeCeilingsRequest,
);

/**
 * Hook for fetching a single office ceiling by ID
 * Reserved for single-item fetch scenarios (e.g., populating an edit-by-ID dialog).
 * Not consumed by any component in the current PR — kept for future use.
 *
 * Usage:
 * const { data, isLoading } = useOfficeCeilingById({
 *   pathParams: { id: 'ceiling-id' }
 * })
 */
export const useOfficeCeilingById = createQueryHookFromTemplate(
  getOfficeCeilingRequest,
);

/**
 * Hook for creating a new office ceiling
 *
 * Usage:
 * const { mutate, isPending } = useCreateOfficeCeiling();
 * mutate({
 *   pathParams: {}, // create endpoint doesn't require path params, but the arg shape requires this field
 *   payload: {
 *     fiscalYearId: 'fy-id',
 *     targetType: '0',
 *     officeId: 'office-id',
 *     agencyMasterBudgetId: 'budget-id',
 *     psAmount: 1000000,
 *     mooeAmount: 500000,
 *     coAmount: 250000,
 *     status: '0',
 *     isSupplemental: false,
 *   },
 * })
 *
 * Note: Cache invalidation for /office-ceilings is handled in the component
 */
export const useCreateOfficeCeiling = createMutationHookFromTemplate(
  createOfficeCeilingRequest,
);

/**
 * Hook for updating an existing office ceiling
 *
 * Usage:
 * const { mutate, isPending } = useUpdateOfficeCeiling();
 * mutate({
 *   pathParams: { id: 'ceiling-id' },
 *   payload: {
 *     psAmount: 1500000,
 *     mooeAmount: 600000,
 *     coAmount: 300000,
 *     status: '1',
 *   }
 * })
 *
 * Note: Cache invalidation for /office-ceilings is handled in the component
 */
export const useUpdateOfficeCeiling = createMutationHookFromTemplate(
  updateOfficeCeilingRequest,
);

/**
 * Hook for deleting an office ceiling
 *
 * Usage:
 * const { mutate, isPending } = useDeleteOfficeCeiling();
 * mutate({ pathParams: { id: 'ceiling-id' } })
 *
 * Note: Cache invalidation for /office-ceilings is handled in the component
 */
export const useDeleteOfficeCeiling = createMutationHookFromTemplate(
  deleteOfficeCeilingRequest,
);
