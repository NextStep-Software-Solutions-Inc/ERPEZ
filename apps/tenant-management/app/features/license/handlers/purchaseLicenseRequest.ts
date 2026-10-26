import { api } from "~/services/api";
import {
  type APIResponse,
  type MutationBlueprintFromTemplate,
} from "erpez-shared-lib";
import { type LicenseKey } from "../type/LicenseKey";

const endpoint = "/licenses/purchase";

export type PurchaseLicensePayload = {
  tenantId: string;
  plan: string;
  billingCycle: string;
  isAirGapped: boolean;
  allowedDomain: string;
  paymentMethodId?: string;
};

export const purchaseLicenseRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LicenseKey>,
  undefined,
  PurchaseLicensePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }): Promise<APIResponse<LicenseKey>> => {
    const response = await api.post<APIResponse<LicenseKey>>(finalUrl, payload);
    return response.data;
  },
};
