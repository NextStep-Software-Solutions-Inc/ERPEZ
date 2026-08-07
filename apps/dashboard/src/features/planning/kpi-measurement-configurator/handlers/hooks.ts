import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { syncKpiMeasurementsRequest } from './syncKpiMeasurementsRequest'
import { deleteKpiMeasurementRequest } from './deleteKpiMeasurementRequest'
import { getKpiMeasurementRequest } from './getKpiMeasurementRequest'
import { getKpiMeasurementsRequest } from './getKpiMeasurementsRequest'
import { updateKpiMeasurementRequest } from './updateKpiMeasurementRequest'
import type {
  KPIMeasurement,
  SyncKpiMeasurementsPayload,
  UpdateKpiMeasurementPayload,
} from '../types'
import type { PerformanceMeasuringScaleBuilderFormValues } from '../types/performance-measuring-scale.types'

export const useKpiMeasurements = createQueryHookFromTemplate(
  getKpiMeasurementsRequest,
)

const useKpiMeasurementQuery = createQueryHookFromTemplate(
  getKpiMeasurementRequest,
)

const useSyncKpiMeasurementsMutation = createMutationHookFromTemplate(
  syncKpiMeasurementsRequest,
)
const useUpdateKpiMeasurementMutation = createMutationHookFromTemplate(
  updateKpiMeasurementRequest,
)
const useDeleteKpiMeasurementMutation = createMutationHookFromTemplate(
  deleteKpiMeasurementRequest,
)

const invalidateKpiMeasurementQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await queryClient.invalidateQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === 'string' &&
      query.queryKey[0].startsWith('/kpi-measurements'),
  })
}
export function useKpiMeasurement(kpiMeasurementId: string) {
  const query = useKpiMeasurementQuery({
    pathParams: { id: kpiMeasurementId },
    queryParams: {},
  })

  return {
    ...query,
    kpiMeasurement: ((query.data as any)?.data ?? null) as KPIMeasurement | null,
  }
}

export function useSyncKpiMeasurements() {
  const mutation = useSyncKpiMeasurementsMutation()
  const queryClient = useQueryClient()

  const syncKpiMeasurements = async (payload: SyncKpiMeasurementsPayload) => {
    const result = await mutation.mutateAsync({
      pathParams: {},
      payload,
    })

    await invalidateKpiMeasurementQueries(queryClient)
    return result
  }

  return {
    syncKpiMeasurements,
    isPending: mutation.isPending,
  }
}

export function useUpdateKpiMeasurement() {
  const mutation = useUpdateKpiMeasurementMutation()
  const queryClient = useQueryClient()

  const updateKpiMeasurement = async (
    kpiMeasurementId: string,
    payload: UpdateKpiMeasurementPayload,
  ) => {
    const result = await mutation.mutateAsync({
      pathParams: { id: kpiMeasurementId },
      payload,
    })

    await invalidateKpiMeasurementQueries(queryClient)
    return result
  }

  return {
    updateKpiMeasurement,
    isPending: mutation.isPending,
  }
}

export function useDeleteKpiMeasurement() {
  const mutation = useDeleteKpiMeasurementMutation()
  const queryClient = useQueryClient()

  const deleteKpiMeasurement = async (kpiMeasurementId: string) => {
    const result = await mutation.mutateAsync({
      pathParams: { id: kpiMeasurementId },
    })

    await invalidateKpiMeasurementQueries(queryClient)
    return result
  }

  return {
    deleteKpiMeasurement,
    isPending: mutation.isPending,
  }
}

/**
 * Sync KPI measurements for a Master KPI (Bulk)
 * Replaces existing measurements for the given KPI in a single transactional request
 */
export function useCreateKpiMeasurementsBulk() {
  const { syncKpiMeasurements, isPending } = useSyncKpiMeasurements()

  const createKpiMeasurementsBulk = async (
    builderData: PerformanceMeasuringScaleBuilderFormValues,
  ) => {
    const { masterKPIId, scales } = builderData

    if (!masterKPIId) throw new Error('Master KPI ID is required')
    if (!scales || scales.length === 0) {
      throw new Error('At least one scale is required')
    }

    const payload: SyncKpiMeasurementsPayload = {
      kpiId: masterKPIId,
      measurements: scales.map((scale) => ({
        name: scale.name,
        statement: scale.statement,
        dimensions: scale.dimensions,
        ratingScaleTemplateId: scale.templateId || null,
        moVs: scale.mov.map((m) => m || null),
        isMOVEditable: scale.isMOVEditable,
        isScaleEditable: scale.isScaleEditable,
      })),
    }

    return await syncKpiMeasurements(payload)
  }

  return {
    createKpiMeasurementsBulk,
    isPending,
  }
}
