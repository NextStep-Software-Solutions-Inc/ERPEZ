import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  PositionCategorySetting,
  PlantillaTypeSetting,
  PMTMaximumSeatsSetting,
  PersonnelReportingTypeSetting,
  StepSetting,
  AllSettings,
} from '@/components/features/planning/organizational-structure/types'
import {
  fetchAllSettings,
} from '@/services/mock/settings'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { createAdministrativeLevelRequest, deleteAdministrativeLevelRequest, getAdministrativeLevelRequest, getAdministrativeLevelsRequest, updateAdministrativeLevelRequest } from '@/components/features/planning/organizational-structure/settings/handlers/administrative-level'
import {
  getOfficeTypesRequest,
  getOfficeTypeRequest,
  createOfficeTypeRequest,
  updateOfficeTypeRequest,
  deleteOfficeTypeRequest,
} from '@/components/features/planning/organizational-structure/settings/handlers/office-type'
import {
  getOfficeCategoriesRequest,
  getOfficeCategoryRequest,
  createOfficeCategoryRequest,
  updateOfficeCategoryRequest,
  deleteOfficeCategoryRequest,
} from '@/components/features/planning/organizational-structure/settings/handlers/office-category'
import {
  getProcurementWorkflowsRequest,
  getProcurementWorkflowRequest,
  createProcurementWorkflowRequest,
  updateProcurementWorkflowRequest,
  deleteProcurementWorkflowRequest,
} from '@/components/features/planning/organizational-structure/settings/handlers/procurement-workflow'
import {
  getClustersRequest,
  getClusterRequest,
  createClusterRequest,
  updateClusterRequest,
  deleteClusterRequest,
} from '@/components/features/planning/organizational-structure/settings/handlers/cluster'
import {
  getPositionTypesRequest,
  getPositionTypeRequest,
  createPositionTypeRequest,
  updatePositionTypeRequest,
  deletePositionTypeRequest,
} from '@/components/features/planning/organizational-structure/settings/handlers/position-type'
import {
  getSalaryGradesRequest,
  getSalaryGradeRequest,
  createSalaryGradeRequest,
  updateSalaryGradeRequest,
  deleteSalaryGradeRequest,
} from '@/components/features/planning/organizational-structure/settings/handlers/salary-grade'
import {
  getPlantillaTypesRequest,
  getPlantillaTypeRequest,
  createPlantillaTypeRequest,
  updatePlantillaTypeRequest,
  deletePlantillaTypeRequest,
} from '@/components/features/planning/organizational-structure/settings/handlers/plantilla-type'
import {
  getStepsRequest,
  getStepRequest,
  createStepRequest,
  updateStepRequest,
  deleteStepRequest,
} from '@/components/features/planning/organizational-structure/settings/handlers/step'
import {
  getPositionCategoriesRequest,
  getPositionCategoryRequest,
  createPositionCategoryRequest,
  updatePositionCategoryRequest,
  deletePositionCategoryRequest,
} from '@/components/features/planning/organizational-structure/settings/handlers/position-category'
import {
  getPMTMaximumSeatsRequest,
  getPMTMaximumSeatRequest,
  createPMTMaximumSeatsRequest,
  updatePMTMaximumSeatsRequest,
  deletePMTMaximumSeatsRequest,
} from '@/components/features/planning/organizational-structure/settings/handlers/pmt-maximum-seats'
import {
  getPersonnelReportingTypesRequest,
  getPersonnelReportingTypeRequest,
  createPersonnelReportingTypeRequest,
  updatePersonnelReportingTypeRequest,
  deletePersonnelReportingTypeRequest,
} from '@/components/features/planning/organizational-structure/settings/handlers/personnel-reporting-type'

// Organization hook (for selecting parent organization when creating a unit)
import { getOrganizationCodesRequest } from '@/features/uacs/code-segments/handlers/getOrganizationCodesRequest'

export const useOrganizationCodes = createQueryHookFromTemplate(getOrganizationCodesRequest)

// ============================================
// OFFICE TYPE HOOKS
// ============================================

export const useOfficeTypes = createQueryHookFromTemplate(getOfficeTypesRequest)

export const useOfficeType = createQueryHookFromTemplate(getOfficeTypeRequest)

// Helper to wrap mutation hooks so they invalidate the list + allSettings on success
function makeMutationWithRefresh(baseHook: () => UseMutationResult<any, unknown, any, unknown>, listQueryKey: string) {
  return function useWrappedMutation() {
    const qc = useQueryClient()
    const mutation = baseHook()

    const invalidateAll = () => {
      qc.invalidateQueries({ queryKey: [listQueryKey] })
      qc.invalidateQueries({ queryKey: ['allSettings'] })
    }

    const wrapOptions = (opts?: UseMutationOptions<any, unknown, any, unknown>) => ({
      ...opts,
      onSuccess: (data: any, variables: any, context: any) => {
        opts?.onSuccess?.(...args)
        invalidateAll()
      },
    })

    return {
      ...mutation,
      mutate: (variables: any, options?: UseMutationOptions<any, unknown, any, unknown>) => mutation.mutate(variables, wrapOptions(options)),
      mutateAsync: (variables: any, options?: UseMutationOptions<any, unknown, any, unknown>) => mutation.mutateAsync(variables, wrapOptions(options)),
    }
  }
}

const _useCreateOfficeType = createMutationHookFromTemplate(createOfficeTypeRequest)
export const useCreateOfficeType = makeMutationWithRefresh(_useCreateOfficeType, '/office-types')

const _useUpdateOfficeType = createMutationHookFromTemplate(updateOfficeTypeRequest)
export const useUpdateOfficeType = makeMutationWithRefresh(_useUpdateOfficeType, '/office-types')

const _useDeleteOfficeType = createMutationHookFromTemplate(deleteOfficeTypeRequest)
export const useDeleteOfficeType = makeMutationWithRefresh(_useDeleteOfficeType, '/office-types')

// ============================================
// OFFICE CATEGORY HOOKS
// ============================================

export const useOfficeCategories = createQueryHookFromTemplate(getOfficeCategoriesRequest)

export const useOfficeCategory = createQueryHookFromTemplate(getOfficeCategoryRequest)

const _useCreateOfficeCategory = createMutationHookFromTemplate(createOfficeCategoryRequest)
export const useCreateOfficeCategory = makeMutationWithRefresh(_useCreateOfficeCategory, '/categories')

const _useUpdateOfficeCategory = createMutationHookFromTemplate(updateOfficeCategoryRequest)
export const useUpdateOfficeCategory = makeMutationWithRefresh(_useUpdateOfficeCategory, '/categories')

const _useDeleteOfficeCategory = createMutationHookFromTemplate(deleteOfficeCategoryRequest)
export const useDeleteOfficeCategory = makeMutationWithRefresh(_useDeleteOfficeCategory, '/categories')

// ============================================
// PROCUREMENT WORKFLOW HOOKS
// ============================================

export const useProcurementWorkflows = createQueryHookFromTemplate(getProcurementWorkflowsRequest)

export const useProcurementWorkflow = createQueryHookFromTemplate(getProcurementWorkflowRequest)

const _useCreateProcurementWorkflow = createMutationHookFromTemplate(createProcurementWorkflowRequest)
export const useCreateProcurementWorkflow = makeMutationWithRefresh(_useCreateProcurementWorkflow, '/procurement-workflows')

const _useUpdateProcurementWorkflow = createMutationHookFromTemplate(updateProcurementWorkflowRequest)
export const useUpdateProcurementWorkflow = makeMutationWithRefresh(_useUpdateProcurementWorkflow, '/procurement-workflows')

const _useDeleteProcurementWorkflow = createMutationHookFromTemplate(deleteProcurementWorkflowRequest)
export const useDeleteProcurementWorkflow = makeMutationWithRefresh(_useDeleteProcurementWorkflow, '/procurement-workflows')

// ============================================
// SATELLITE CLUSTER HOOKS
// ============================================

export const useSatelliteClusters = createQueryHookFromTemplate(getClustersRequest)

export const useSatelliteCluster = createQueryHookFromTemplate(getClusterRequest)

const _useCreateSatelliteCluster = createMutationHookFromTemplate(createClusterRequest)
export const useCreateSatelliteCluster = makeMutationWithRefresh(_useCreateSatelliteCluster, '/clusters')

const _useUpdateSatelliteCluster = createMutationHookFromTemplate(updateClusterRequest)
export const useUpdateSatelliteCluster = makeMutationWithRefresh(_useUpdateSatelliteCluster, '/clusters')

const _useDeleteSatelliteCluster = createMutationHookFromTemplate(deleteClusterRequest)
export const useDeleteSatelliteCluster = makeMutationWithRefresh(_useDeleteSatelliteCluster, '/clusters')

// ============================================
// ============================================
// POSITION TYPE HOOKS
// ============================================

export const usePositionTypes = createQueryHookFromTemplate(getPositionTypesRequest)

export const usePositionType = createQueryHookFromTemplate(getPositionTypeRequest)

const _useCreatePositionType = createMutationHookFromTemplate(createPositionTypeRequest)
export const useCreatePositionType = makeMutationWithRefresh(_useCreatePositionType, '/position-types')

const _useUpdatePositionType = createMutationHookFromTemplate(updatePositionTypeRequest)
export const useUpdatePositionType = makeMutationWithRefresh(_useUpdatePositionType, '/position-types')

const _useDeletePositionType = createMutationHookFromTemplate(deletePositionTypeRequest)
export const useDeletePositionType = makeMutationWithRefresh(_useDeletePositionType, '/position-types')

// ============================================
// POSITION CATEGORY HOOKS
// ============================================

export const usePositionCategories = createQueryHookFromTemplate(getPositionCategoriesRequest)

export const usePositionCategory = createQueryHookFromTemplate(getPositionCategoryRequest)

const _useCreatePositionCategory = createMutationHookFromTemplate(createPositionCategoryRequest)
export const useCreatePositionCategory = makeMutationWithRefresh(_useCreatePositionCategory, '/position-categories')

const _useUpdatePositionCategory = createMutationHookFromTemplate(updatePositionCategoryRequest)
export const useUpdatePositionCategory = makeMutationWithRefresh(_useUpdatePositionCategory, '/position-categories')

const _useDeletePositionCategory = createMutationHookFromTemplate(deletePositionCategoryRequest)
export const useDeletePositionCategory = makeMutationWithRefresh(_useDeletePositionCategory, '/position-categories')

// ============================================
// SALARY GRADE HOOKS
// ============================================

export const useSalaryGrades = createQueryHookFromTemplate(getSalaryGradesRequest)

export const useSalaryGrade = createQueryHookFromTemplate(getSalaryGradeRequest)

const _useCreateSalaryGrade = createMutationHookFromTemplate(createSalaryGradeRequest)
export const useCreateSalaryGrade = makeMutationWithRefresh(_useCreateSalaryGrade, '/salary-grades')

const _useUpdateSalaryGrade = createMutationHookFromTemplate(updateSalaryGradeRequest)
export const useUpdateSalaryGrade = makeMutationWithRefresh(_useUpdateSalaryGrade, '/salary-grades')

const _useDeleteSalaryGrade = createMutationHookFromTemplate(deleteSalaryGradeRequest)
export const useDeleteSalaryGrade = makeMutationWithRefresh(_useDeleteSalaryGrade, '/salary-grades')

// ============================================
// PLANTILLA TYPE HOOKS
// ============================================

export const usePlantillaTypes = createQueryHookFromTemplate(getPlantillaTypesRequest)

export const usePlantillaType = createQueryHookFromTemplate(getPlantillaTypeRequest)

const _useCreatePlantillaType = createMutationHookFromTemplate(createPlantillaTypeRequest)
export const useCreatePlantillaType = makeMutationWithRefresh(_useCreatePlantillaType, '/plantilla-types')

const _useUpdatePlantillaType = createMutationHookFromTemplate(updatePlantillaTypeRequest)
export const useUpdatePlantillaType = makeMutationWithRefresh(_useUpdatePlantillaType, '/plantilla-types')

const _useDeletePlantillaType = createMutationHookFromTemplate(deletePlantillaTypeRequest)
export const useDeletePlantillaType = makeMutationWithRefresh(_useDeletePlantillaType, '/plantilla-types')

// ============================================
// PMT MAXIMUM SEATS HOOKS
// ============================================

export const usePMTMaximumSeats = createQueryHookFromTemplate(getPMTMaximumSeatsRequest)

export const usePMTMaximumSeat = createQueryHookFromTemplate(getPMTMaximumSeatRequest)

const _useCreatePMTMaximumSeats = createMutationHookFromTemplate(createPMTMaximumSeatsRequest)
export const useCreatePMTMaximumSeats = makeMutationWithRefresh(_useCreatePMTMaximumSeats, '/pmt-maximum-seats')

const _useUpdatePMTMaximumSeats = createMutationHookFromTemplate(updatePMTMaximumSeatsRequest)
export const useUpdatePMTMaximumSeats = makeMutationWithRefresh(_useUpdatePMTMaximumSeats, '/pmt-maximum-seats')

const _useDeletePMTMaximumSeats = createMutationHookFromTemplate(deletePMTMaximumSeatsRequest)
export const useDeletePMTMaximumSeats = makeMutationWithRefresh(_useDeletePMTMaximumSeats, '/pmt-maximum-seats')

// ============================================
// PERSONNEL REPORTING TYPE HOOKS
// ============================================

export const usePersonnelReportingTypes = createQueryHookFromTemplate(getPersonnelReportingTypesRequest)

export const usePersonnelReportingType = createQueryHookFromTemplate(getPersonnelReportingTypeRequest)

const _useCreatePersonnelReportingType = createMutationHookFromTemplate(createPersonnelReportingTypeRequest)
export const useCreatePersonnelReportingType = makeMutationWithRefresh(_useCreatePersonnelReportingType, '/personnel-reporting-types')

const _useUpdatePersonnelReportingType = createMutationHookFromTemplate(updatePersonnelReportingTypeRequest)
export const useUpdatePersonnelReportingType = makeMutationWithRefresh(_useUpdatePersonnelReportingType, '/personnel-reporting-types')

const _useDeletePersonnelReportingType = createMutationHookFromTemplate(deletePersonnelReportingTypeRequest)
export const useDeletePersonnelReportingType = makeMutationWithRefresh(_useDeletePersonnelReportingType, '/personnel-reporting-types')

// ============================================
// ADMINISTRATIVE LEVEL HOOKS
// ============================================

export const useAdministrativeLevels = createQueryHookFromTemplate(getAdministrativeLevelsRequest)

export const useAdministrativeLevel = createQueryHookFromTemplate(getAdministrativeLevelRequest)

const _useCreateAdministrativeLevel = createMutationHookFromTemplate(createAdministrativeLevelRequest)
export const useCreateAdministrativeLevel = makeMutationWithRefresh(_useCreateAdministrativeLevel, '/administrative-levels')

const _useUpdateAdministrativeLevel = createMutationHookFromTemplate(updateAdministrativeLevelRequest)
export const useUpdateAdministrativeLevel = makeMutationWithRefresh(_useUpdateAdministrativeLevel, '/administrative-levels')

const _useDeleteAdministrativeLevel = createMutationHookFromTemplate(deleteAdministrativeLevelRequest)
export const useDeleteAdministrativeLevel = makeMutationWithRefresh(_useDeleteAdministrativeLevel, '/administrative-levels')

// ============================================
// STEP HOOKS
// ============================================

export const useSteps = createQueryHookFromTemplate(getStepsRequest)

export const useStep = createQueryHookFromTemplate(getStepRequest)

const _useCreateStep = createMutationHookFromTemplate(createStepRequest)
export const useCreateStep = makeMutationWithRefresh(_useCreateStep, '/steps')

const _useUpdateStep = createMutationHookFromTemplate(updateStepRequest)
export const useUpdateStep = makeMutationWithRefresh(_useUpdateStep, '/steps')

const _useDeleteStep = createMutationHookFromTemplate(deleteStepRequest)
export const useDeleteStep = makeMutationWithRefresh(_useDeleteStep, '/steps')

// ============================================
// BULK SETTINGS HOOKS
// ============================================

export function useAllSettings() {
  return useQuery<AllSettings, Error>({
    queryKey: ['allSettings'],
    queryFn: fetchAllSettings,
    staleTime: 1000 * 60,
  })
}
