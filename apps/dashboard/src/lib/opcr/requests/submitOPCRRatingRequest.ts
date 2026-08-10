import type { MutationBlueprintFromTemplate, APIResponse, QueryParams } from 'erpez-shared-lib';
import api from '@/services/api';

const endpoint = '/opcrs/:id/rating/submit';

export const submitOPCRRatingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  QueryParams,
  Record<string, never>
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<boolean>>(finalUrl, {});
    return response.data;
  },
};
