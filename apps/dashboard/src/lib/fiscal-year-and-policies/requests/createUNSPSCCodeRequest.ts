import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { UNSPSCCode } from '../unspsc-code.types';
import api from '@/services/api';

const endpoint = '/unspsc-codes';

export type CreateUNSPSCCodePayload = {
  code: string | null;
  name: string | null;
  level: number;
  parentId: string | null;
};

export const createUNSPSCCodeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<UNSPSCCode>,
  undefined,
  CreateUNSPSCCodePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<UNSPSCCode>>(finalUrl, payload);
    return response.data;
  },
};
