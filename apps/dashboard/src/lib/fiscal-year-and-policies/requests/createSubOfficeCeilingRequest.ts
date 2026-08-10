import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib';
import type { SubOfficeCeiling } from '../types';
import api from '@/services/api';

const endpoint = '/sub-office-ceilings';

export type CreateSubOfficeCeilingPayload = {
  officeCeilingId: string;
  subOfficeId: string;
  fundSourceId: string;
  fiscalYearId: string;
  psAmount: number;
  mooeAmount: number;
  coAmount: number;
  status: string | null;
};

export const createSubOfficeCeilingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SubOfficeCeiling>,
  undefined,
  CreateSubOfficeCeilingPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<SubOfficeCeiling>>(finalUrl, payload);
    return response.data;
  },
};
