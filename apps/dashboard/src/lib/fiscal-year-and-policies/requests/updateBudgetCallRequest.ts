import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { BudgetCall } from '../types';
import api from '@/services/api';

const endpoint = '/budget-calls/:id';

export type UpdateBudgetCallPayload = {
  type?: string;
  submissionDeadline?: string; // ISO string
};

export const updateBudgetCallRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BudgetCall>,
  undefined,
  UpdateBudgetCallPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<BudgetCall>>(finalUrl, payload);
    return response.data;
  },
};
