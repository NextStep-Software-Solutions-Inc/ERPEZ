import { createMutationHookFromTemplate } from 'erpez-shared-lib';
import { createProcurementPolicyConfigRequest } from '@/lib/fiscal-year-and-policies/requests/createProcurementPolicyConfigRequest';
import { updateProcurementPolicyConfigRequest } from '@/lib/fiscal-year-and-policies/requests/updateProcurementPolicyConfigRequest';
import { deleteProcurementPolicyConfigRequest } from '@/lib/fiscal-year-and-policies/requests/deleteProcurementPolicyConfigRequest';

export const useCreateProcurementPolicyConfig = createMutationHookFromTemplate(
  createProcurementPolicyConfigRequest
);

export const useUpdateProcurementPolicyConfig = createMutationHookFromTemplate(
  updateProcurementPolicyConfigRequest
);

export const useDeleteProcurementPolicyConfig = createMutationHookFromTemplate(
  deleteProcurementPolicyConfigRequest
);

export type CreatePolicyConfigMutationParams = {
  pathParams: Record<string, unknown>;
  payload: {
    fiscalYearId: string;
    organizationId?: string;
    procurementModeId: string;
    procurementModeThresholdId: string;
    minAmount: number;
    maxAmount?: number;
  };
};

export type UpdatePolicyConfigMutationParams = {
  pathParams: { id: string };
  payload: {
    procurementModeThresholdId?: string;
    minAmount?: number;
    maxAmount?: number | null;
  };
};

export type DeletePolicyConfigMutationParams = {
  pathParams: { id: string };
};
