import type { QueryBlueprintFromTemplate, QueryKey, APIResponse, QueryParams } from 'erpez-shared-lib';
import type { FunctionConfig } from '../types';
import api from '@/services/api';

const endpoint = '/function-configs/:id';

export const getFunctionConfigRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FunctionConfig>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<FunctionConfig>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
