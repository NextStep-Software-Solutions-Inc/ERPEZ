import { api } from "~/services/api";
import {
  type APIResponse,
  type QueryBlueprintFromTemplate,
} from "erpez-shared-lib";
import { type InquiriesSummary } from "../type/Inquiry";

const endpoint = "/inquiries";

export const getInquiriesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<InquiriesSummary>,
  undefined
> = {
  endpoint,
  key: ({ url }) => ["get-inquiries", url] as const,
  fetcher: async ({
    finalUrl,
    signal,
  }): Promise<APIResponse<InquiriesSummary>> => {
    const response = await api.get<APIResponse<InquiriesSummary>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
