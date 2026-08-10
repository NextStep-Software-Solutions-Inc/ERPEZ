import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib';
import { getAgencyMasterBudgetsRequest } from '../handlers/getAgencyMasterBudgetsRequest';
import { getAgencyMasterBudgetRequest } from '../handlers/getAgencyMasterBudgetRequest';
import { createAgencyMasterBudgetRequest } from '../handlers/createAgencyMasterBudgetRequest';
import { updateAgencyMasterBudgetRequest } from '../handlers/updateAgencyMasterBudgetRequest';
import { deleteAgencyMasterBudgetRequest } from '../handlers/deleteAgencyMasterBudgetRequest';

/**
 * Hook for fetching all agency master budgets
 *
 * Usage:
 * const { data, isLoading } = useAgencyMasterBudgets({
 *   pathParams: {},
 *   queryParams: {}
 * })
 */
export const useAgencyMasterBudgets = createQueryHookFromTemplate(
  getAgencyMasterBudgetsRequest,
);

/**
 * Hook for fetching a single agency master budget by ID
 *
 * Usage:
 * const { data, isLoading } = useAgencyMasterBudgetById({
 *   pathParams: { id: 'budget-id' }
 * })
 */
export const useAgencyMasterBudgetById = createQueryHookFromTemplate(
  getAgencyMasterBudgetRequest,
);

/**
 * Hook for creating a new agency master budget
 *
 * Usage:
 * const { mutate, isPending } = useCreateAgencyMasterBudget();
 * mutate({
 *   fiscalYearId: 'fy-id',
 *   fundSourceId: 'fs-id',
 *   sourceDocumentType: '0',
 *   psAmount: 5000000,
 *   mooeAmount: 3000000,
 *   coAmount: 2000000,
 * })
 *
 * Note: Cache invalidation for /agency-master-budgets is handled in the component
 */
export const useCreateAgencyMasterBudget = createMutationHookFromTemplate(
  createAgencyMasterBudgetRequest,
);

/**
 * Hook for updating an existing agency master budget
 *
 * Usage:
 * const { mutate, isPending } = useUpdateAgencyMasterBudget();
 * mutate({
 *   pathParams: { id: 'budget-id' },
 *   payload: {
 *     fiscalYearId: 'fy-id',
 *     fundSourceId: 'fs-id',
 *     sourceDocumentType: '0',
 *     psAmount: 5000000,
 *     mooeAmount: 3000000,
 *     coAmount: 2000000,
 *   }
 * })
 *
 * Note: Cache invalidation for /agency-master-budgets is handled in the component
 */
export const useUpdateAgencyMasterBudget = createMutationHookFromTemplate(
  updateAgencyMasterBudgetRequest,
);

/**
 * Hook for deleting an agency master budget
 *
 * Usage:
 * const { mutate, isPending } = useDeleteAgencyMasterBudget();
 * mutate({ pathParams: { id: 'budget-id' } })
 *
 * Note: Cache invalidation for /agency-master-budgets is handled in the component
 */
export const useDeleteAgencyMasterBudget = createMutationHookFromTemplate(
  deleteAgencyMasterBudgetRequest,
);
