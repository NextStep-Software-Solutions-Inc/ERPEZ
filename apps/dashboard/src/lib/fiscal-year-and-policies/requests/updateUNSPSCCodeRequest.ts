import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { UNSPSCCode } from '../unspsc-code.types';
import api from '@/services/api';

const endpoint = '/unspsc-codes/:id';

export type UpdateUNSPSCCodePayload = {
  code?: string | null;
  name?: string | null;
  description?: string | null;
  level?: number | null;
  parentId?: string | null;
  isActive?: boolean;
};

export const updateUNSPSCCodeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<UNSPSCCode>,
  undefined,
  UpdateUNSPSCCodePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<UNSPSCCode>>(finalUrl, payload);
    return response.data;
  },
};
