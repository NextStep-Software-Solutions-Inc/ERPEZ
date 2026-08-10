/**
 * Master KPI Unified Dialog Component
 */
import { useAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { AlertCircle, AlertTriangle } from 'lucide-react'
import { KpiForm } from '../forms/KpiForm'
import { createKpiRequest } from '../handlers/createKpiRequest'
import {
  createKpiPayloadFromForm,
  updateKpiPayloadFromForm,
} from '../utils/createKpiPayload.ts'
import {
  kpiDialogModeAtom,
  kpiDialogOpenAtom,
  selectedKpiForEditAtom,
} from '../atoms'
import { FunctionCategory } from '../types'
import type { KpiAttributeOption, KpiSdgOption, MasterKPI } from '../types'
import type { KpiFormValues } from '../forms/kpi.schema'
import type { Attribute } from '@/components/features/planning/attribute/types'
import { getAttributesRequest } from '@/components/features/planning/attribute/handlers/getAttributesRequest'
import { getSDGsRequest } from '@/components/features/planning/SDGs/handlers/getSDGsRequest'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { updateKpiRequest } from '../handlers/updateKpiRequest.ts'

interface KpiDialogProps {
  availableKpis: Array<MasterKPI>
}

const useCreateKpi = createMutationHookFromTemplate(createKpiRequest)
const useUpdateKpi = createMutationHookFromTemplate(updateKpiRequest)
const useAttributes = createQueryHookFromTemplate(getAttributesRequest)
const useSdgs = createQueryHookFromTemplate(getSDGsRequest)

const normalizeLookupValue = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '')

const matchesLookupValue = (candidate: string, option: string) => {
  const candidateValue = normalizeLookupValue(candidate)
  const optionValue = normalizeLookupValue(option)
  return (
    candidateValue === optionValue ||
    candidateValue.includes(optionValue) ||
    optionValue.includes(candidateValue)
  )
}

const mapToLookupIds = (
  values: Array<string> | undefined,
  options: Array<{
    id: string
    name: string
    code?: string
    description?: string | null
  }>,
) => {
  if (!values?.length) return []

  return values
    .map((value) => {
      const match = options.find((option) =>
        [option.id, option.name, option.code, option.description]
          .filter((entry): entry is string => Boolean(entry))
          .some((entry) => matchesLookupValue(value, entry)),
      )
      return match?.id
    })
    .filter((id): id is string => Boolean(id))
}

const getKpiEditTags = (
  selectedKpi: MasterKPI | null,
  availableAttributes: Array<KpiAttributeOption>,
  availableSdgs: Array<KpiSdgOption>,
) => {
  if (!selectedKpi) {
    return {
      functionCategory: FunctionCategory.CORE,
      complianceTags: [],
      developmentGoals: [],
    }
  }

  return {
    functionCategory: selectedKpi.functionCategory ?? FunctionCategory.CORE,
    complianceTags: mapToLookupIds(
      selectedKpi.attributes?.map((attribute) => attribute.id),
      availableAttributes,
    ),
    developmentGoals: mapToLookupIds(
      selectedKpi.SDGs?.map((sdg) => sdg.id),
      availableSdgs,
    ),
  }
}

export function KpiDialog({ availableKpis }: KpiDialogProps) {
  const [open, setOpen] = useAtom(kpiDialogOpenAtom)
  const [mode] = useAtom(kpiDialogModeAtom)
  const [selectedKpi] = useAtom(selectedKpiForEditAtom)
  const [isLoading, setIsLoading] = useState(false)
  const [validationSummary, setValidationSummary] = useState<Array<string>>([])
  const queryClient = useQueryClient()
  const createKpiMutation = useCreateKpi()
  const updateKpiMutation = useUpdateKpi()

  const { data: sdgsResponse, isLoading: isSdgsLoading } = useSdgs({
    pathParams: {},
    queryParams: { pageSize: 50 },
    enabled: open,
  })


  const { data: attributesResponse, isLoading: isAttributesLoading } =
    useAttributes({
      pathParams: {},
      queryParams: { pageSize: 1000, pageNumber: 1 },
      enabled: open,
    })

  const availableSdgs: Array<KpiSdgOption> = sdgsResponse?.data ?? []
  const availableAttributes: Array<KpiAttributeOption> = useMemo(
    () =>
      (attributesResponse?.data ?? [])
        .filter((attribute: Attribute) => attribute.parentAttributeId == null)
        .map((attribute: Attribute) => ({
          id: attribute.id,
          name: attribute.name,
          code: attribute.code,
          description: attribute.description ?? null,
        })),
    [attributesResponse?.data],
  )

  const isEdit = mode === 'edit'
  const formId = `form-kpi-${mode}`
  const selectedKpiTags = useMemo(
    () =>
      getKpiEditTags(selectedKpi ?? null, availableAttributes, availableSdgs),
    [availableAttributes, availableSdgs, selectedKpi],
  )

  const initialValues = useMemo<Partial<KpiFormValues> | undefined>(() => {
    if (!isEdit || !selectedKpi) return undefined
    return {
      code: selectedKpi.code,
      name: selectedKpi.name,
      operationalDefinition: selectedKpi.operationalDefinition,
      monitoringFrequency: selectedKpi.monitoringFrequency,
      measurementUnit: selectedKpi.measurementUnit,
      isGAD: selectedKpi.isGAD,
      parentKPIId: selectedKpi.parentKPIId ?? null,
      mfopapId: selectedKpi.mfopapId ?? null,
      functionCategory: selectedKpiTags.functionCategory,
      complianceTags: mapToLookupIds(
        selectedKpiTags.complianceTags,
        availableAttributes,
      ),
      developmentGoals: mapToLookupIds(
        selectedKpiTags.developmentGoals,
        availableSdgs,
      ),
      targetDistributionBehavior:
        selectedKpi.targetDistributionBehavior ?? null,
      isOptIn: selectedKpi.isOptIn,
      status: selectedKpi.status ?? undefined,
    }
  }, [availableAttributes, availableSdgs, isEdit, selectedKpi, selectedKpiTags])

  const hasSubKpis =
    isEdit && availableKpis.some((k) => k.parentKPIId === selectedKpi?.id)

  const handleSubmit = async (data: KpiFormValues) => {
    setIsLoading(true)
    try {
      if (isEdit && selectedKpi) {
        await updateKpiMutation.mutateAsync({
          pathParams: { id: selectedKpi.id },
          payload: updateKpiPayloadFromForm(data),
        })
        toast.success('Indicator updated successfully')
      } else {
        await createKpiMutation.mutateAsync({
          pathParams: {},
          payload: createKpiPayloadFromForm(data),
        })
        toast.success('Indicator created successfully')
      }

      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.startsWith('/kpis')
        },
      })
      setOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to ${mode} indicator`,
      )
    } finally {
      setIsLoading(false)
    }
  }
  const handleValidationSummaryChange = useCallback((errors: Array<string>) => {
    setValidationSummary(errors)
  }, [])

  const footer = (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
      <div className="min-h-10">
        {validationSummary.length > 0 && (
          <Alert
            variant="outline"
            className="border-destructive text-destructive"
          >
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">
                  Please fix the following before submitting:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validationSummary.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <div className="flex gap-3 justify-end w-full md:justify-end md:self-end">
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={isLoading}
          type="button"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          color="primary"
          type="submit"
          form={formId}
          disabled={isLoading}
        >
          {isLoading
            ? 'Processing...'
            : isEdit
              ? 'Update Indicator'
              : 'Create Indicator'}
        </Button>
      </div>
    </div>
  )

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={setOpen}
      title={
        isEdit
          ? 'Edit Key Performance Indicator'
          : 'Create Key Performance Indicator'
      }
      description={
        isEdit
          ? 'Modify the details of this existing indicator. Changes will be applied across the system.'
          : 'Define a new performance measure. This indicator will be available for planning and monitoring.'
      }
      size="3xl"
      footer={footer}
    >
      <div className="space-y-4 py-2">
        {/* Warning Alerts for Edit Mode */}
        {isEdit && (
          <div className="space-y-3">
            {hasSubKpis && (
              <Alert variant="outline" className="border-warning text-warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This KPI has sub-KPIs. Significant changes to its definition
                  might affect nested measurements.
                </AlertDescription>
              </Alert>
            )}
            <Alert variant="soft" color="info">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Editing this KPI will update <b>{selectedKpi?.code}</b> in all
                linked Target and Accomplishment reports.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <KpiForm
          key={`${mode}-${selectedKpi?.id ?? 'new'}-${availableSdgs.length}-${availableAttributes.length}`}
          formId={formId}
          mode={mode}
          currentKpiId={selectedKpi?.id}
          onValidationSummaryChange={handleValidationSummaryChange}
          onSubmit={handleSubmit}
          isLoading={isLoading || isSdgsLoading || isAttributesLoading}
          isOpen={open}
          initialValues={initialValues}
          availableKpis={availableKpis}
          availableSdgs={availableSdgs}
          availableAttributes={availableAttributes}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}
