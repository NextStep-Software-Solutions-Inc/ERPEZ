import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { OfficeCeiling } from '../types';
import api from '@/services/api';

const endpoint = '/office-ceilings/:id';

export type UpdateOfficeCeilingPayload = {
  fiscalYearId?: string;
  targetType?: string | null;
  officeId?: string;
  agencyMasterBudgetId?: string;
  psAmount?: number;
  mooeAmount?: number;
  coAmount?: number;
  status?: string | null;
  isSupplemental?: boolean;
};

export const updateOfficeCeilingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OfficeCeiling>,
  undefined,
  UpdateOfficeCeilingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<OfficeCeiling>>(finalUrl, payload);
    return response.data;
  },
};
