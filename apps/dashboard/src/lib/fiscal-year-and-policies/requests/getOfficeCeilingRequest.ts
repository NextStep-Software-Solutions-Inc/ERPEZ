import type { QueryBlueprintFromTemplate, QueryKey, APIResponse, QueryParams } from 'erpez-shared-lib';
import type { OfficeCeiling } from '../types';
import api from '@/services/api';

const endpoint = '/office-ceilings/:id';

export const getOfficeCeilingRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OfficeCeiling>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<OfficeCeiling>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
