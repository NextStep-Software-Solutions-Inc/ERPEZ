import { api } from "~/services/api";
import {
  type APIResponse,
  type MutationBlueprintFromTemplate,
} from "erpez-shared-lib";
import { type LicenseKey } from "../type/LicenseKey";

const endpoint = "/licenses/activate";

type Payload = {
  key: string;
  tenantId: string;
  currentDomain: string;
};

export const activateLicenseRequest: MutationBlueprintFromTemplate<
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
