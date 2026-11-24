import { api } from "~/services/api";
import {
  type APIResponse,
  type QueryBlueprintFromTemplate,
} from "erpez-shared-lib";
import { type LicenseKey } from "../type/LicenseKey";

const endpoint = "/licenses/tenant/:id";

type QueryParams = {
  domain?: string;
};

export const getTenantLicenseRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LicenseKey>,
  QueryParams
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  defaultOptions: {
    retry: false,
  },
  fetcher: async ({
    finalUrl,
    signal,
  }): Promise<APIResponse<LicenseKey>> => {
    const response = await api.get<APIResponse<LicenseKey>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
