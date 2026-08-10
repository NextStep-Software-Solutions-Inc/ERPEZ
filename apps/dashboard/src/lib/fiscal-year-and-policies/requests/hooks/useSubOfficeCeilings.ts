import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib';
import { getSubOfficeCeilingsRequest } from '../getSubOfficeCeilingsRequest';
import { getSubOfficeCeilingRequest } from '../getSubOfficeCeilingRequest';
import { createSubOfficeCeilingRequest } from '../createSubOfficeCeilingRequest';
import { updateSubOfficeCeilingRequest } from '../updateSubOfficeCeilingRequest';
import { deleteSubOfficeCeilingRequest } from '../deleteSubOfficeCeilingRequest';

/**
 * Hook for fetching all sub-office ceilings (dept. ceilings)
 *
 * Usage:
 * const { data, isLoading } = useSubOfficeCeilings({
 *   pathParams: {},
 *   queryParams: { pageSize: 200 }
 * })
 */
export const useSubOfficeCeilings = createQueryHookFromTemplate(
  getSubOfficeCeilingsRequest,
);

/**
 * Hook for fetching a single sub-office ceiling by ID
 *
 * Usage:
 * const { data, isLoading } = useSubOfficeCeilingById({
 *   pathParams: { id: 'sub-office-ceiling-id' },
 *   queryParams: {} // include when the request type expects QueryParams
 * })
 */
export const useSubOfficeCeilingById = createQueryHookFromTemplate(
  getSubOfficeCeilingRequest,
);

/**
 * Hook for creating a new sub-office ceiling
 *
 * Usage:
 * const { mutate, isPending } = useCreateSubOfficeCeiling();
 * mutate({
 *   pathParams: {},
 *   payload: {
 *     officeCeilingId: 'office-ceiling-id',
 *     subOfficeId: 'sub-office-id',
 *     fundSourceId: 'fund-source-id',
 *     fiscalYearId: 'fiscal-year-id',
 *     psAmount: 100000,
 *     mooeAmount: 50000,
 *     coAmount: 25000,
 *     status: '0',
 *   },
 * })
 *
 * Note: Cache invalidation for /sub-office-ceilings is handled in the component
 */
export const useCreateSubOfficeCeiling = createMutationHookFromTemplate(
  createSubOfficeCeilingRequest,
);

/**
 * Hook for updating an existing sub-office ceiling
 *
 * Usage:
 * const { mutate, isPending } = useUpdateSubOfficeCeiling();
 * mutate({
 *   pathParams: { id: 'sub-office-ceiling-id' },
 *   payload: {
 *     psAmount: 150000,
 *     mooeAmount: 60000,
 *     coAmount: 30000,
 *     status: '1',
 *   }
 * })
 *
 * Note: Cache invalidation for /sub-office-ceilings is handled in the component
 */
export const useUpdateSubOfficeCeiling = createMutationHookFromTemplate(
  updateSubOfficeCeilingRequest,
);

/**
 * Hook for deleting a sub-office ceiling
 *
 * Usage:
 * const { mutate, isPending } = useDeleteSubOfficeCeiling();
 * mutate({ pathParams: { id: 'sub-office-ceiling-id' } })
 *
 * Note: Cache invalidation for /sub-office-ceilings is handled in the component
 */
export const useDeleteSubOfficeCeiling = createMutationHookFromTemplate(
  deleteSubOfficeCeilingRequest,
);
