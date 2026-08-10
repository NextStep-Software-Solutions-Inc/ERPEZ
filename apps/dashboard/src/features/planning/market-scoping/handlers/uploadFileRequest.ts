/**
 * Upload File Attachment
 * Mutation handler - uploads activity evidence or parameter attachments
 * 
 * MOCK DATA READY: Returns mock file upload response
 * TO SWITCH TO REAL API: Replace the return statement in fetcher with:
 *   const response = await api.post<APIResponse<UploadFileResponse>>(finalUrl, payload);
 *   return response.data;
 */

import type { MutationBlueprintFromTemplate, APIResponse } from "erpez-shared-lib";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import api from "@/services/api";

const endpoint = "/market-scoping/:id/upload" as const;
// Keep api imported for commented-out real API code below
void api;

export interface UploadFilePayload extends FormData {
  // FormData properties are automatically included
}

export interface UploadFileResponse {
  fileId: string;
  fileName: string;
  fileUrl: string;
  uploadedDate: string;
}

export const uploadFileRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<UploadFileResponse>,
  undefined,
  FormData
> = {
  endpoint,
  fetcher: async () => {
    // MOCK DATA - Return mock file upload response
    const mockFileName = "uploaded-file-" + Date.now() + ".pdf";
    return {
      succeeded: true,
      data: {
        fileId: `file-${Date.now()}`,
        fileName: mockFileName,
        fileUrl: `/documents/${mockFileName}`,
        uploadedDate: new Date().toISOString(),
      },
      message: "File uploaded successfully",
      errors: undefined,
    } as unknown as APIResponse<UploadFileResponse>;
    
    // REAL API - Uncomment when backend is ready:
    // void api; // Reference api to avoid unused import warning
    // const response = await api.post<APIResponse<UploadFileResponse>>(finalUrl, payload);
    // return response.data;
  },
};
