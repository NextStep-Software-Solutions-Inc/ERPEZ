import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { SubOfficeCeiling } from '../types';
import api from '@/services/api';

const endpoint = '/sub-office-ceilings/:id';

export type UpdateSubOfficeCeilingPayload = {
  officeCeilingId?: string;
  subOfficeId?: string;
  fundSourceId?: string;
  fiscalYearId?: string;
  psAmount?: number;
  mooeAmount?: number;
  coAmount?: number;
  status?: string | null;
};

export const updateSubOfficeCeilingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SubOfficeCeiling>,
  undefined,
  UpdateSubOfficeCeilingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<SubOfficeCeiling>>(finalUrl, payload);
    return response.data;
  },
};
