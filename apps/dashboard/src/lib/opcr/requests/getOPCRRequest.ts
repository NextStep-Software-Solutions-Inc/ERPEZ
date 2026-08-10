import type { QueryBlueprintFromTemplate, QueryKey, APIResponse, QueryParams } from 'erpez-shared-lib';
import type { OPCRDetails } from '../types';
import api from '@/services/api';

const endpoint = '/opcrs/:id';

export const getOPCRRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCRDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<OPCRDetails>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
