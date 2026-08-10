/**
 * Custom React Hooks for Market Scoping API Operations
 * Uses factory pattern from erpez-shared-lib
 */

import { createQueryHookFromTemplate, createMutationHookFromTemplate } from "erpez-shared-lib";
import { getMarketScopingsRequest } from "../handlers/getMarketScopingsRequest";
import { getMarketScopingDetailsRequest } from "../handlers/getMarketScopingDetailsRequest";
import { createMarketScopingRequest } from "../handlers/createMarketScopingRequest";
import { updateMarketScopingRequest } from "../handlers/updateMarketScopingRequest";
import { submitMarketScopingRequest } from "../handlers/submitMarketScopingRequest";
import { approveMarketScopingRequest } from "../handlers/approveMarketScopingRequest";
import { rejectMarketScopingRequest } from "../handlers/rejectMarketScopingRequest";
import { generatePdfRequest } from "../handlers/generatePdfRequest";
import { deleteMarketScopingRequest } from "../handlers/deleteMarketScopingRequest";
import { uploadFileRequest } from "../handlers/uploadFileRequest";

/**
 * Query: Get all market scoping forms for current user
 */
export const useMarketScopings = createQueryHookFromTemplate(getMarketScopingsRequest);

/**
 * Query: Get single market scoping form details
 */
export const useMarketScopingDetails = createQueryHookFromTemplate(getMarketScopingDetailsRequest);

/**
 * Mutation: Create new market scoping form
 */
export const useCreateMarketScoping = createMutationHookFromTemplate(createMarketScopingRequest);

/**
 * Mutation: Update existing market scoping form
 */
export const useUpdateMarketScoping = createMutationHookFromTemplate(updateMarketScopingRequest);

/**
 * Mutation: Submit market scoping for approval
 */
export const useSubmitMarketScoping = createMutationHookFromTemplate(submitMarketScopingRequest);

/**
 * Mutation: Approve market scoping
 */
export const useApproveMarketScoping = createMutationHookFromTemplate(approveMarketScopingRequest);

/**
 * Mutation: Reject market scoping
 */
export const useRejectMarketScoping = createMutationHookFromTemplate(rejectMarketScopingRequest);

/**
 * Mutation: Generate PDF export
 */
export const useGeneratePdf = createMutationHookFromTemplate(generatePdfRequest);

/**
 * Mutation: Delete market scoping
 */
export const useDeleteMarketScoping = createMutationHookFromTemplate(deleteMarketScopingRequest);

/**
 * Mutation: Upload file to market scoping
 */
export const useUploadFile = createMutationHookFromTemplate(uploadFileRequest);
