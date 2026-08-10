import type { QueryBlueprintFromTemplate, QueryKey, PaginationResponse, QueryParams } from 'erpez-shared-lib';
import type { ProcurementMode } from '../procurement-threshold.types';
import api from '@/services/api';

const endpoint = '/procurement-modes';

export const getProcurementModesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ProcurementMode>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ProcurementMode>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
