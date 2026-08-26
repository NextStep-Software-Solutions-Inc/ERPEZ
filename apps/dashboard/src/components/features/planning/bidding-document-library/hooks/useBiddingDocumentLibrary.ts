import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import {
  getMasterDocumentsRequest,
  createMasterDocumentRequest,
  updateMasterDocumentRequest,
  deleteMasterDocumentRequest,
} from '../handlers/masterDocumentHandlers'
import {
  getProfilesRequest,
  createProfileRequest,
  updateProfileRequest,
  deleteProfileRequest,
  getProfileByIdRequest,
} from '../handlers/profileHandlers'
import {
  getProjectChecklistRequest,
  loadProfileRequest,
  addCustomRequirementRequest,
  updateChecklistItemRequest,
  deleteChecklistItemRequest,
  confirmChecklistRequest,
  resetChecklistRequest,
} from '../handlers/projectChecklistHandlers'

// Master Documents
export const useMasterDocuments = createQueryHookFromTemplate(
  getMasterDocumentsRequest
)
export const useCreateMasterDocument = createMutationHookFromTemplate(
  createMasterDocumentRequest
)
export const useUpdateMasterDocument = createMutationHookFromTemplate(
  updateMasterDocumentRequest
)
export const useDeleteMasterDocument = createMutationHookFromTemplate(
  deleteMasterDocumentRequest
)

// Profiles
export const useProfiles = createQueryHookFromTemplate(getProfilesRequest)
export const useCreateProfile =
  createMutationHookFromTemplate(createProfileRequest)
export const useUpdateProfile =
  createMutationHookFromTemplate(updateProfileRequest)
export const useDeleteProfile =
  createMutationHookFromTemplate(deleteProfileRequest)

// Project Checklists
export const useProjectChecklist = createQueryHookFromTemplate(
  getProjectChecklistRequest
)
export const useLoadProfile = createMutationHookFromTemplate(loadProfileRequest)
export const useAddCustomRequirement = createMutationHookFromTemplate(
  addCustomRequirementRequest
)
export const useUpdateChecklistItem = createMutationHookFromTemplate(
  updateChecklistItemRequest
)
export const useDeleteChecklistItem = createMutationHookFromTemplate(
  deleteChecklistItemRequest
)
export const useConfirmChecklist = createMutationHookFromTemplate(
  confirmChecklistRequest
)
export const useResetChecklist = createMutationHookFromTemplate(
  resetChecklistRequest
)
export const useProfileById = createQueryHookFromTemplate(
  getProfileByIdRequest
)

