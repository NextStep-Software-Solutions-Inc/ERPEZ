import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import api from '@/services/api';

const endpoint = '/procurement-policy-configs/:id';

export const deleteProcurementPolicyConfigRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<boolean>>(finalUrl);
    return response.data;
  },
};
