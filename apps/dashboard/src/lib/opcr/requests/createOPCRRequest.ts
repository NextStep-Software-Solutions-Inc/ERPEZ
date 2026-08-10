import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib';
import type { CreateOPCRPayload, OPCRListItem } from '../types';
import api from '@/services/api';

const endpoint = '/opcrs';

export const createOPCRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCRListItem>,
  undefined,
  CreateOPCRPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<OPCRListItem>>(finalUrl, payload);
    return response.data;
  },
};
