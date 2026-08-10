import { useCallback, useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Save } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import BasicInformationSection from '../../form/BasicInformationSection'
import PerformanceMeasuresSection from '../../form/PerformanceMeasuresSection'
import TargetSection from '../../form/TargetSection'
import { getKpiRequest } from '../../handlers/getKpiRequest'
import { createSubKpiFormSchema } from '../../form/CreateKpiForm'
import type { Attribute } from '../../../attribute/types'
import type { CreateKpiFormType, CreateKpiFormValues } from '../../form/CreateKpiForm';
import type { KPI, Mfopap } from '../../types'
import type { SDG } from '../../../SDGs/types'
import type { MultiStepFormStep } from '@/components/MultiStepForm';
import MultiStepForm from '@/components/MultiStepForm'

// Define error types to match MultiStepForm expectations
export interface FieldError {
  message: string
  code?: string
  [key: string]: unknown
}

export interface FormErrors {
  [key: string]: FieldError | FormErrors | Array<FieldError> | Array<FormErrors>
}

const useKpi = createQueryHookFromTemplate(getKpiRequest)

/** Re-export schema and types for external use */
export const updateSubKpiSchema = createSubKpiFormSchema
export type UpdateSubKpiFormValues = CreateKpiFormValues

interface UpdateSubKpiFormProps {
  subKpi: KPI
  onSubmit: (data: CreateKpiFormType) => void
  onCancel: () => void
  isLoading?: boolean
}

/** Transform SubKPI data to form values */
function transformSubKpiToFormValues(
  subKpi: KPI,
): Partial<CreateKpiFormValues> {
  return {
    name: subKpi.name || '',
    description: subKpi.description || '',
    SDGIds: (subKpi.SDGs || []).map((sdg: string | SDG) =>
      typeof sdg === 'string' ? sdg : sdg.id,
    ),
    KPIRatings:
      subKpi.kpiRatings?.map((r) => ({
        performanceMeasureId: r.performanceMeasure.id || r.id,
        ratings: r.ratings?.map((rating) => ({
          value: rating.value ?? 0,
          remarks: rating.remarks ?? '',
        })) || [{ value: 0, remarks: '' }],
      })) || [],
    KPITargets:
      subKpi.kpiTargets?.map((t) => ({
        period: t.period || 'Annual',
        targetValue: t.value || 0,
        quarterName: t.quarterName || 'Annual',
      })) || [],
    KPIMOVs: subKpi.kpiMovs?.flat().map((m) => ({
      name: m.name || '',
      description: m.description || '',
      fileId: m.file || '',
    })) || [{ name: '', description: '', fileId: '' }],
  }
}

/** Validation helpers */
const canProceedStep1 = (v: CreateKpiFormValues) =>
  (v.name.trim().length) >= 3 && (v.SDGIds.length) >= 1
const canProceedStep2 = (v: CreateKpiFormValues) =>
  Array.isArray(v.KPIRatings) && v.KPIRatings.length > 0
const canProceedStep3 = (v: CreateKpiFormValues) =>
  Array.isArray(v.KPITargets) && v.KPITargets.length > 0

export default function UpdateSubKpiForm({
  subKpi,
  onSubmit,
  onCancel,
  isLoading = false,
}: UpdateSubKpiFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const parentKPIId = subKpi.parentKPIId || ''

  // Fetch parent KPI data for inheritance
  const { data: parentKpiData } = useKpi({
    pathParams: { id: parentKPIId },
    queryParams: {},
  })
  const parentKpi = parentKPIId ? parentKpiData?.data : undefined
  const parentSdgIds =
    parentKpi?.SDGs?.map(sdg => sdg) || []

  // Initialize form with existing SubKPI data
  const initialValues = useMemo(
    () => transformSubKpiToFormValues(subKpi),
    [subKpi],
  )

  // Ensure SDGIds is always an array of strings
  const normalizedInitialValues = useMemo(
    () => ({
      ...initialValues,
      SDGIds: (initialValues.SDGIds || []).map((sdg: string | SDG) =>
        typeof sdg === 'string' ? sdg : sdg.id,
      ),
    }),
    [initialValues],
  )

  const form = useForm({
    defaultValues: {
      // Inherit all fields from parent KPI
      name: parentKpi?.name || '',
      description: parentKpi?.description || '',
      functionType: parentKpi?.functionType || '',
      isOfficeMandate: parentKpi?.isOfficeMandate ?? false,
      isPercentage: parentKpi?.isPercentage ?? false,
      isTargetValueAllocable: parentKpi?.isTargetValueAllocable ?? false,
      AttributeIds: parentKpi?.Attributes?.map((a: Attribute) => a.id) || [], 
      MFOPAPIds: parentKpi?.MFOPAPs?.[0]?.id || '',
      KPITargets:
        parentKpi?.kpiTargets?.map((t) => ({
          period: t.period || 'Annual',
          targetValue: t.value || 0,
          quarterName: t.quarterName || 'Annual',
        })) || [],
      KPIRatings:
        parentKpi?.kpiRatings?.map((r) => ({
          performanceMeasureId: r.performanceMeasure?.id || r.id,
          ratings: r.ratings?.map((rating) => ({
            value: rating.value ?? 0,
            remarks: rating.remarks ?? '',
          })) || [{ value: 0, remarks: '' }],
        })) || [],
      KPIMOVs: parentKpi?.kpiMovs?.flat().map((m) => ({
        name: m.name || '',
        description: m.description || '',
        fileId: m.file || '',
      })) || [{ name: '', description: '', fileId: '' }],
      // Override with SubKPI specific values (SDGIds already normalized to strings)
      ...normalizedInitialValues,
    },
    validators: { onChange: createSubKpiFormSchema },
    onSubmit: (values) => {
      const cleanKPIMOVs = values.value.KPIMOVs.map((mov) => ({
        name: mov.name,
        description: mov.description,
        ...(mov.fileId && { fileId: mov.fileId }),
      }))
      const payload = {
        ...values.value,
        KPIMOVs: cleanKPIMOVs,
        MFOPAPIds: parentKpi?.MFOPAPs?.map((m: Mfopap) => m.id) || [],
        AttributeIds: parentKpi?.Attributes?.map((a: Attribute) => a.id) || [],
        functionType: parentKpi?.functionType || subKpi.functionType,
        isOfficeMandate: parentKpi?.isOfficeMandate ?? subKpi.isOfficeMandate,
        isPercentage: parentKpi?.isPercentage ?? subKpi.isPercentage,
        isTargetValueAllocable:
          parentKpi?.isTargetValueAllocable ?? subKpi.isTargetValueAllocable,
        parentKPIId,
      }
      onSubmit(payload as unknown as CreateKpiFormType)
    },
  })

  const handleSubmit = useCallback(() => {
    console.log('Submitting form with values:', form.state.values)
    if (form.state.canSubmit) form.handleSubmit()
  }, [form])

  const handleCancel = useCallback(() => onCancel(), [onCancel])

  const steps: Array<MultiStepFormStep<CreateKpiFormValues>> = useMemo(
    () => [
      {
        title: 'Basic Information',
        content: (
          <BasicInformationSection
            form={form}
            isLoading={isLoading}
            mode="subKpi"
            parentSdgIds={parentSdgIds}
          />
        ),
        canProceed: canProceedStep1,
      },
      {
        title: 'Choose Performance',
        content: (
          <PerformanceMeasuresSection
            form={form}
            isLoading={isLoading}
            mode="subKpi"
          />
        ),
        canProceed: canProceedStep2,
      },
      {
        title: 'Set Targets',
        content: (
          <TargetSection
            form={form}
            isLoading={isLoading}
            // mode="subKpi"
          />
        ),
        canProceed: canProceedStep3,
      },
    ],
    [form, isLoading, parentSdgIds],
  )

  const formApi = useMemo(
    () => ({
      state: {
        values: form.state.values,
        isDirty: form.state.isDirty,
        errors: form.state.errors as unknown as FormErrors,
      },
      reset: () => form.reset(),
      handleSubmit: () => form.handleSubmit(),
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
      submitButtonText="Update Sub-KPI"
      submitIcon={<Save className="w-4 h-4 mr-1" />}
      isLoading={isLoading}
    />
  )
}
