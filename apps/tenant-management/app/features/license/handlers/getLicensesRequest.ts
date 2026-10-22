import { api } from "~/services/api";
import {
  type PaginationResponse,
  type QueryBlueprintFromTemplate,
} from "erpez-shared-lib";
import { type LicenseKey } from "../type/LicenseKey";

const endpoint = "/licenses";

type QueryParams = {
  pageSize?: number;
  page?: number;
};

export const getLicensesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<LicenseKey>,
  QueryParams
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({
    finalUrl,
    signal,
  }): Promise<PaginationResponse<LicenseKey>> => {
    const response = await api.get<PaginationResponse<LicenseKey>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
