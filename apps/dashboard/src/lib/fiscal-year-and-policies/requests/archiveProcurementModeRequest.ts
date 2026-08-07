import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { ProcurementMode } from '../procurement-threshold.types';
import api from '@/services/api';

const endpoint = '/procurement-modes/:id/archive';

export const archiveProcurementModeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementMode>,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<ProcurementMode>>(finalUrl);
    return response.data;
  },
};
