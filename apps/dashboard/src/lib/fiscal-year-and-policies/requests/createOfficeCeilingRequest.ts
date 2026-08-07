import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { OfficeCeiling } from '../types';
import api from '@/services/api';

const endpoint = '/office-ceilings';

export type CreateOfficeCeilingPayload = {
  fiscalYearId: string;
  targetType: string | null;
  officeId: string;
  agencyMasterBudgetId: string;
  psAmount: number;
  mooeAmount: number;
  coAmount: number;
  status: string | null;
  isSupplemental: boolean;
};

export const createOfficeCeilingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OfficeCeiling>,
  undefined,
  CreateOfficeCeilingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<OfficeCeiling>>(finalUrl, payload);
    return response.data;
  },
};
