import { api } from "~/services/api";
import {
  type APIResponse,
  type MutationBlueprintFromTemplate,
} from "erpez-shared-lib";
import { type LicenseKey } from "../type/LicenseKey";

const endpoint = "/licenses/generate";

type Payload = {
  prefix: string;
  boundEmail: string;
  plan: number; // 0=Free, 1=Pro, 2=Enterprise, 3=OnPremise
  allowedDomain: string;
  maxTenants: number;
  maxUsers: number;
  expiresAt: string;
  isAirGapped: boolean;
  tenantId?: string;
  notes?: string;
};

export const generateLicenseRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LicenseKey>,
  undefined,
  Payload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }): Promise<APIResponse<LicenseKey>> => {
    const response = await api.post<APIResponse<LicenseKey>>(finalUrl, payload);
    return response.data;
  },
};
