import { api } from "~/services/api";
import {
  type APIResponse,
  type MutationBlueprintFromTemplate,
} from "erpez-shared-lib";
import { type LicenseKey } from "../type/LicenseKey";

const endpoint = "/licenses/trial";

type Payload = {
  tenantId: string;
  allowedDomain?: string;
};

export const claimTrialLicenseRequest: MutationBlueprintFromTemplate<
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
