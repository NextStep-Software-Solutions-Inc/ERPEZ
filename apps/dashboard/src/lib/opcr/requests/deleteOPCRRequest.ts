import type { MutationBlueprintFromTemplate, APIResponse, QueryParams } from 'erpez-shared-lib';
import api from '@/services/api';

const endpoint = '/opcrs/:id';

export const deleteOPCRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  QueryParams
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<boolean>>(finalUrl);
    return response.data;
  },
};
