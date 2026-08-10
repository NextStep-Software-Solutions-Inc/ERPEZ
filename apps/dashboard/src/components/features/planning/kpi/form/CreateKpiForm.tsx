import { useCallback, useEffect, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { useAtom, useSetAtom } from 'jotai'
import { useParams } from '@tanstack/react-router'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { getKpiRequest } from '../handlers/getKpiRequest'
import { createFileRequest } from '../../file-upload/handlers/createFileRequest'
import BasicInformationSection from './BasicInformationSection'
import PerformanceMeasuresSection from './PerformanceMeasuresSection'
import TargetSection from './TargetSection'
import type { FormErrors } from '../subKpi/forms/UpdateSubKpiForm'
import type { KPI } from '../types'
import type { SDG } from '../../SDGs/types'
import type { Attribute } from '../../attribute/types'
import type { MultiStepFormStep } from '@/components/MultiStepForm'
import MultiStepForm from '@/components/MultiStepForm'

import { useKpiStateCleanup } from '@/hooks/useKpiState'
import {
  kpiFormValuesAtom,
  kpiFormStepAtom,
  clearKpiFormStorageAtom,
  defaultFormValues,
} from './kpiFormAtoms'

const useKpi = createQueryHookFromTemplate(getKpiRequest)
const useCreateFile = createMutationHookFromTemplate(createFileRequest)

const baseFields = {
  name: z.string().min(5).max(100),
  description: z.string(),
  SDGIds: z.array(z.string()).min(1),
  KPIRatings: z.array(
    z.object({
      performanceMeasureId: z.string(),
      ratings: z.array(
        z.object({
          value: z.number(),
          remarks: z.string(),
        }),
      ),
    }),
  ),
  KPITargets: z
    .array(
      z.object({
        period: z.string(),
        targetValue: z.number(),
        quarterName: z.string(),
      }),
    )
    .min(1),
  KPIMOVs: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string(),
        fileId: z.string().optional(),
        file: z.instanceof(File).optional(),
      }),
    )
    .min(1),
}

export const createKpiFormSchema = z.object({
  ...baseFields,
  functionType: z.string().min(1),
  isOfficeMandate: z.boolean(),
  isPercentage: z.boolean(),
  isTargetValueAllocable: z.boolean(),
  AttributeIds: z.array(z.string()).min(1),
  MFOPAPId: z.string(),
})

export const createSubKpiFormSchema = z.object({
  ...baseFields,
  functionType: z.string().optional(),
  isOfficeMandate: z.boolean(),
  isPercentage: z.boolean(),
  isTargetValueAllocable: z.boolean(),
  AttributeIds: z.array(z.string()).min(1),
  MFOPAPId: z.string(),
})

export type CreateKpiFormValues = z.infer<typeof createKpiFormSchema>
export type CreateKpiFormType = CreateKpiFormValues & { parentKPIId?: string }
export type CreateSubKpiFormType = CreateKpiFormValues & { parentKPIId: string }
// export type CreateSubKpiFormType = Omit<CreateKpiFormValues & { parentKPIId: string }, 'MFOPAPId' >

export type FormType = ReturnType<typeof useKpiForm>

/** Transform KPI data to form values for update mode */
function transformKpiToFormValues(kpi: KPI): Partial<CreateKpiFormValues> {
  return {
    name: kpi.name || '',
    description: kpi.description || '',
    SDGIds: (kpi.SDGs || []).map((sdg: string | SDG) =>
      typeof sdg === 'string' ? sdg : sdg.id,
    ),
    // KPIRatings:
    //   kpi.kpiRatings?.map((r) => ({
    //     performanceMeasureId: r.performanceMeasure.id || r.id,
    //     ratings: r.ratings?.map((rating) => ({
    //       value: rating.value ?? 0,
    //       remarks: rating.remarks ?? '',
    //     })) || [{ value: 0, remarks: '' }],
    //   })) || [],
    KPIRatings:
      kpi.kpiRatings?.reduce(
        (acc, r) => {
          const existing = acc.find(
            (item) => item.performanceMeasureId === r.performanceMeasureId,
          )
          if (existing) {
            existing.ratings.push({
              value: r.numericalRating,
              remarks: r.remarks,
            })
          } else {
            acc.push({
              performanceMeasureId: r.performanceMeasureId,
              ratings: [
                {
                  value: r.numericalRating,
                  remarks: r.remarks,
                },
              ],
            })
          }
          return acc
        },
        [] as Array<{
          performanceMeasureId: string
          ratings: Array<{
            value: number
            remarks: string
          }>
        }>,
      ) || [],
    KPITargets:
      kpi.kpiTargets?.map((t) => ({
        period: t.period || 'Annual',
        targetValue: t.value || 0,
        quarterName: t.quarterName || 'Annual',
      })) || [],
    KPIMOVs: kpi.kpiMovs?.flat().map((m) => ({
      name: m.name || '',
      description: m.description || '',
      fileId: m.file || '',
    })) || [{ name: '', description: '', fileId: '' }],
    functionType: kpi.functionType || '',
    isOfficeMandate: kpi.isOfficeMandate,
    isPercentage: kpi.isPercentage,
    isTargetValueAllocable: kpi.isTargetValueAllocable,
    AttributeIds: kpi.Attributes?.map((a: Attribute) => a.id) || [],
    MFOPAPId: kpi.MFOPAP || '',
  }
}

interface CreateKpiFormProps<Mode extends 'kpi' | 'subKpi' = 'kpi'> {
  onSubmit: (
    data: Mode extends 'subKpi' ? CreateSubKpiFormType : CreateKpiFormType,
  ) => void
  onCancel: (form: FormType) => void
  onSubmitSuccess?: () => void
  isLoading?: boolean
  mode?: Mode
  /** Initial data for update mode (KPI object to prepopulate form) */
  initialData?: KPI
  /** Custom submit button text (defaults based on mode) */
  submitButtonText?: string
}

function useKpiForm(
  onSubmitCallback: (data: CreateKpiFormType) => void,
  initialValues: Partial<CreateKpiFormValues>,
  mode: 'kpi' | 'subKpi',
) {
  const uploadMutation = useCreateFile()
  return useForm({
    defaultValues: {
      name: '',
      description: '',
      functionType: '',
      isOfficeMandate: false,
      isPercentage: false,
      isTargetValueAllocable: false,
      SDGIds: [] as Array<string>,
      AttributeIds: [] as Array<string>,
      MFOPAPId: '',
      KPITargets: [] as Array<{
        period: string
        targetValue: number
        quarterName: string
      }>,
      KPIRatings: [] as Array<{
        performanceMeasureId: string
        ratings: Array<{
          value: number
          remarks: string
        }>
      }>,
      KPIMOVs: [{ name: '', description: '', fileId: '' }],
      // Apply initialValues (from localStorage or update mode)
      ...initialValues,
    },
    validators: {
      onChange:
        mode === 'subKpi'
          ? (createSubKpiFormSchema as unknown as typeof createKpiFormSchema)
          : createKpiFormSchema,
    },
    onSubmit: async (values) => {
      // Upload files first
      const KPIMOVsWithUploadedFiles = await Promise.all(
        values.value.KPIMOVs.map(async (mov) => {
          if (mov.file) {
            try {
              const result = await uploadMutation.mutateAsync({
                pathParams: {},
                payload: { file: mov.file },
              })
              if (!result.succeeded || !result.data) {
                throw new Error(result.message || 'Upload failed')
              }
              return {
                name: mov.name,
                description: mov.description,
                fileId: result.data,
              }
            } catch (error) {
              console.error('File upload failed:', error)
              // Handle error, perhaps set fileId to empty or throw
              return {
                name: mov.name,
                description: mov.description,
                fileId: '',
              }
            }
          } else {
            return {
              name: mov.name,
              description: mov.description,
              fileId: mov.fileId || '',
            }
          }
        }),
      )

      // Clean KPIMOVs to omit fileId if blank
      const cleanKPIMOVs = KPIMOVsWithUploadedFiles.map((mov) => ({
        name: mov.name,
        description: mov.description,
        ...(mov.fileId && { fileId: mov.fileId }),
      }))

      // Build base payload - parent data handling is done at component level
      const payload = {
        ...values.value,
        KPIMOVs: cleanKPIMOVs,
        AttributeIds: values.value.AttributeIds,
      }

      onSubmitCallback(payload as unknown as CreateKpiFormType)
    },
  })
}

const canProceedStep1SubKpi = (v: CreateKpiFormValues) =>
  v.name.trim().length >= 3 && v.SDGIds.length >= 1
const canProceedStep1 = (v: CreateKpiFormValues) =>
  v.name.trim().length >= 3 &&
  v.functionType.length >= 1 &&
  v.AttributeIds.length >= 1 &&
  v.SDGIds.length >= 1
const canProceedStep2 = (v: CreateKpiFormValues) =>
  Array.isArray(v.KPIRatings) && v.KPIRatings.length > 0
const canProceedStep3 = (v: CreateKpiFormValues) =>
  Array.isArray(v.KPITargets) && v.KPITargets.length > 0

export default function CreateKpiForm<Mode extends 'kpi' | 'subKpi' = 'kpi'>({
  onSubmit,
  onCancel,
  onSubmitSuccess,
  isLoading = false,
  mode,
  initialData,
  submitButtonText,
}: CreateKpiFormProps<Mode>) {
  // Extract parentKPIId from URL params when in subKpi mode
  const params = useParams({ strict: false })
  const parentKPIId = mode === 'subKpi' ? params.kpiId : undefined

  // Fetch parent KPI data when in subKpi mode
  const { data: parentKpiData } = useKpi({
    pathParams: { id: parentKPIId || '' },
    queryParams: {},
  })

  const parentKpi =
    mode === 'subKpi' && parentKPIId ? parentKpiData?.data : undefined

  const parentSdgIds = parentKpi?.SDGs || []

  // Jotai atoms for localStorage persistence
  const [persistedValues, setPersistedValues] = useAtom(kpiFormValuesAtom)
  const [currentStep, setCurrentStep] = useAtom(kpiFormStepAtom)
  const clearStorage = useSetAtom(clearKpiFormStorageAtom)

  // Hook to cleanup all KPI-related state
  const cleanupKpiState = useKpiStateCleanup()

  // Use initialData for update mode, otherwise use persisted values
  const formInitialValues = useMemo(() => {
    const base = initialData
      ? transformKpiToFormValues(initialData)
      : persistedValues
    if (mode === 'subKpi' && parentKpi) {
      return {
        ...base,
        AttributeIds: parentKpi.Attributes?.map((a: Attribute) => a.id) || [],
      }
    }
    return base
  }, [initialData, persistedValues, mode, parentKpi])
  const handleFormSubmit = useCallback(
    (formData: CreateKpiFormType) => {
      // For SubKPI mode, override with parent's values
      if (mode === 'subKpi' && parentKpi) {
        const enhancedPayload = {
          ...formData,
          // Inherit these fields from parent KPI
          functionType: parentKpi.functionType,
          isOfficeMandate: parentKpi.isOfficeMandate,
          isPercentage: parentKpi.isPercentage,
          isTargetValueAllocable: parentKpi.isTargetValueAllocable,
          AttributeIds: parentKpi.Attributes?.map((a: Attribute) => a.id) || [],
          MFOPAPId: parentKpi.MFOPAP.id || '',
          parentKPIId: parentKpi.id,
        }

        onSubmit(
          enhancedPayload as unknown as CreateKpiFormType as Mode extends 'subKpi'
            ? CreateSubKpiFormType
            : CreateKpiFormType,
        )
      } else {
        onSubmit(
          formData as Mode extends 'subKpi'
            ? CreateSubKpiFormType
            : CreateKpiFormType,
        )
      }
    },
    [mode, parentKpi, onSubmit],
  )

  // Initialize form with initial values (from initialData or localStorage)
  const form = useKpiForm(handleFormSubmit, formInitialValues, mode || 'kpi')

  // Sync form changes to Jotai (persisted to localStorage automatically)
  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const values = form.state.values
      setPersistedValues(values as Partial<CreateKpiFormValues>)
    })
    return unsubscribe
  }, [form.store, setPersistedValues])

  // Handle cancel with persistence cleanup
  const handleCancel = useCallback(() => {
    clearStorage()
    cleanupKpiState()
    onCancel(form)
  }, [clearStorage, cleanupKpiState, onCancel, form])

  const handleSubmit = useCallback(() => {
    if (form.state.canSubmit) {
      form.reset()
      form.handleSubmit()
      // Clear localStorage and related state on successful submission
      clearStorage()
      cleanupKpiState()
      // Call the onSubmitSuccess callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    }
  }, [form, clearStorage, cleanupKpiState, onSubmitSuccess])

  // Handle clear persistence for unsaved changes warning
  const handleClearPersistence = useCallback(() => {
    clearStorage()
    cleanupKpiState()
    setPersistedValues(defaultFormValues)
    setCurrentStep(1)
  }, [clearStorage, cleanupKpiState, setPersistedValues, setCurrentStep])

  const steps: Array<MultiStepFormStep<CreateKpiFormValues>> = useMemo(
    () => [
      {
        title: 'Basic Information',
        content: (
          <BasicInformationSection
            form={form}
            isLoading={isLoading}
            mode={mode}
            parentSdgIds={parentSdgIds}
          />
        ),
        canProceed: mode === 'subKpi' ? canProceedStep1SubKpi : canProceedStep1,
      },
      {
        title: 'Choose Performance',
        content: (
          <PerformanceMeasuresSection form={form} isLoading={isLoading} />
        ),
        canProceed: canProceedStep2,
      },
      {
        title: 'Set Targets',
        content: <TargetSection form={form} isLoading={isLoading} />,
        canProceed: canProceedStep3,
      },
    ],
    [form, isLoading, mode, parentSdgIds],
  )

  // Form API adapter for MultiStepForm component
  const formApi = useMemo(
    () => ({
      state: {
        values: form.state.values,
        isDirty: form.state.isDirty,
        errors: form.state.errors as unknown as FormErrors,
      },
      reset: () => form.reset(),
      handleSubmit: () => {
        return form.handleSubmit()
      },
    }),
    [form],
  )

  return (
    <MultiStepForm<CreateKpiFormValues>
      steps={steps}
      form={formApi}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitButtonText={
        submitButtonText ??
        (mode === 'subKpi' ? 'Create Sub-KPI' : 'Create KPI')
      }
      submitIcon={<Plus className="w-4 h-4 mr-1" />}
      isLoading={isLoading}
      onClearPersistence={handleClearPersistence}
    />
  )
}
