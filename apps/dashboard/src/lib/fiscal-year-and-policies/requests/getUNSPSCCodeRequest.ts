import type { QueryBlueprintFromTemplate, QueryKey, APIResponse, QueryParams } from 'erpez-shared-lib';
import type { UNSPSCCode } from '../unspsc-code.types';
import api from '@/services/api';

const endpoint = '/unspsc-codes/:id';

export const getUNSPSCCodeRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<UNSPSCCode>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<UNSPSCCode>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
