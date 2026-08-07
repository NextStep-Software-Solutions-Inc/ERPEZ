import type { QueryBlueprintFromTemplate, QueryKey, APIResponse, QueryParams } from 'erpez-shared-lib';
import type { SubOfficeCeiling } from '../types';
import api from '@/services/api';

const endpoint = '/sub-office-ceilings';

export const getSubOfficeCeilingsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SubOfficeCeiling[]>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<SubOfficeCeiling[]>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
