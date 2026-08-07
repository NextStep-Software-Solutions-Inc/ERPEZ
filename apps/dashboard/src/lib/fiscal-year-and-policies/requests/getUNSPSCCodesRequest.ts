import type { QueryBlueprintFromTemplate, QueryKey, PaginationResponse, QueryParams } from 'erpez-shared-lib';
import type { UNSPSCCode } from '../unspsc-code.types';
import api from '@/services/api';

const endpoint = '/unspsc-codes';

export const getUNSPSCCodesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<UNSPSCCode>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<UNSPSCCode>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
