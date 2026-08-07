import type { QueryBlueprintFromTemplate, QueryKey, PaginationResponse, QueryParams } from 'erpez-shared-lib';
import type { ProcurementPolicyConfig } from '../types';
import api from '@/services/api';

const endpoint = '/procurement-policy-configs';

export const getProcurementPolicyConfigsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ProcurementPolicyConfig>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ProcurementPolicyConfig>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
