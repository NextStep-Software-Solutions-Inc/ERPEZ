import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { positionConfig } from '@/config/position.config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreatePosition } from '@/pages/planning/organization/hooks/useOrgUnits'
import { Loader2 } from 'lucide-react'
import { getPositionTypesRequest } from '../settings/handlers/position-type'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getPlantillaTypesRequest } from '../settings/handlers/plantilla-type'
import { getSalaryGradesRequest } from '../settings/handlers/salary-grade'
import { getStepsRequest } from '../settings/handlers/step'
import { getOrgUnitsRequest } from '../handlers'


export const usePositionTypes = createQueryHookFromTemplate(getPositionTypesRequest)
export const usePlantillaTypes = createQueryHookFromTemplate(getPlantillaTypesRequest)
export const useSalaryGrades = createQueryHookFromTemplate(getSalaryGradesRequest)
export const useSteps = createQueryHookFromTemplate(getStepsRequest)
export const useOffices = createQueryHookFromTemplate(getOrgUnitsRequest)

// schema removed – validation is handled manually inside each field
export type PositionFormValues = Record<string, unknown>

interface CreatePositionFormProps {
  onCreated: () => void
  onClose: () => void
  selectedOrgUnitId?: string
  isDirtyCallback?: (isDirty: boolean) => void
}

export function CreatePositionForm({ onCreated, onClose, selectedOrgUnitId, isDirtyCallback }: CreatePositionFormProps) {
  const createMutation = useCreatePosition()
  const { data: positionTypesResponse } = usePositionTypes({ pathParams: {}, queryParams: {} })
  const positionTypes = positionTypesResponse?.data ?? []

  type PositionOption = { id: string; name: string }
  const positionOptions: PositionOption[] =
    positionTypes.length > 0
      ? positionTypes.map((pt) => ({ id: pt.id, name: pt.name }))
      : positionConfig.positionTypes.map((p) => ({ id: p.value, name: p.label }))


  const { data: plantillaTypesResponse } = usePlantillaTypes({ pathParams: {}, queryParams: {} })
  const plantillaTypes = plantillaTypesResponse?.data ?? []

  type PlantillaTypeOption = { id: string; label: string }
  const plantillaTypeOptions: PlantillaTypeOption[] =
    plantillaTypes.length > 0
      ? plantillaTypes.map((pt) => ({ id: pt.id, label: pt.name }))
      : positionConfig.plantillaTypes.map((p) => ({ id: p.value, label: p.label }))

  const { data: salaryGradesResponse } = useSalaryGrades({ pathParams: {}, queryParams: {} })
  const salaryGrades = salaryGradesResponse?.data ?? []

  type SalaryGradeOption = { id: string; value: number; label: string }
  const salaryGradeOptions: SalaryGradeOption[] =
    salaryGrades.length > 0
      ? salaryGrades.map((sg) => ({
          id: sg.id,
          value: sg.gradeNumber,
          label: sg.name,
        }))
      : positionConfig.salaryGrades.map((sg) => ({ id: sg.value.toString(), value: sg.value, label: sg.label }))

  const { data: stepsResponse } = useSteps({ pathParams: {}, queryParams: {} })
  const steps = stepsResponse?.data ?? []


  type StepOption = { id: string; value: number; label: string }
  const stepOptions: StepOption[] =
    steps.length > 0
      ? steps.map((s) => ({ 
          id: s.id,
          value: Number(s.name.replace('Step ', '')) || 0,
          label: s.name,
        }))
      : positionConfig.steps.map((s) => ({ id: s.value.toString(), value: s.value, label: s.label }))

  const { data: orgUnitsResponse } = useOffices({ pathParams: {}, queryParams: { pageSize: 1000 } })
  const fetchedOrgUnits = orgUnitsResponse?.data ?? []

  const defaultValues = {
    title: '',
    code: '',
    type: '' as string,
    plantillaType: '' as string,
    plantillaItem: '',
    salaryGrade: undefined as number | undefined,
    step: undefined as number | undefined,
    authorizedFTE: undefined as number | undefined,
    officeId: selectedOrgUnitId || '',
    functionalTitle: '',
    jobDescription: '',
    preferredQualifications: '',
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const payload: Record<string, unknown> = {
        title: value.title,
        functionalTitle: value.functionalTitle || '',
        code: value.code,
        jobDescription: value.jobDescription || '',
        qualifications: value.preferredQualifications || '',
        fte: value.authorizedFTE || 0,
        positionTypeId: value.type,
        plantillaTypeId: value.plantillaType,
        salaryGradeId:
          salaryGrades.find((sg) => sg.gradeNumber === value.salaryGrade)?.id || '',
        stepId:
          steps
            .find((st) =>
              Number(st.name.replace('Step ', '')) === value.step
            )
            ?.id || '',
        officeId: value.officeId,
      }

      try {
        await createMutation.mutateAsync(payload as any)
        onCreated()
      } catch (error) {
        console.error('Failed to create position:', error)
      }
    },
  })

  // track validity separately since form.state.isValid isn't configured
  const [isFormValid, setIsFormValid] = useState(false)
  // compute validity manually based on required fields and simple rules.
  // each input that displays a "*" icon must be non‑empty/within bounds.
  useEffect(() => {
    const v = form.state.values as any
    const hasTitle = typeof v.title === 'string' && v.title.trim() !== ''
    const hasCode = typeof v.code === 'string' && v.code.trim() !== ''
    const hasType = typeof v.type === 'string' && v.type !== ''
    const hasPlantillaType = typeof v.plantillaType === 'string' && v.plantillaType !== ''
    const needsPlantillaItem =
      hasPlantillaType &&
      !positionConfig.optionalPlantillaTypes.includes(v.plantillaType)
    const hasPlantillaItem =
      !needsPlantillaItem ||
      (typeof v.plantillaItem === 'string' && v.plantillaItem.trim() !== '')
    const hasSalaryGrade =
      typeof v.salaryGrade === 'number' && v.salaryGrade >= 1 && v.salaryGrade <= 33
    const hasStep = typeof v.step === 'number' && v.step >= 1 && v.step <= 8
    const hasFTE =
      typeof v.authorizedFTE === 'number' && v.authorizedFTE >= 0.5 && v.authorizedFTE <= 2
    const hasOffice = typeof v.officeId === 'string' && v.officeId !== ''
    const hasFunctional =
      typeof v.functionalTitle === 'string' && v.functionalTitle.trim() !== ''
    const hasJobDesc =
      typeof v.jobDescription === 'string' && v.jobDescription.trim() !== ''
    const hasQualifications =
      typeof v.preferredQualifications === 'string' && v.preferredQualifications.trim() !== ''

    setIsFormValid(
      hasTitle &&
      hasCode &&
      hasType &&
      hasPlantillaType &&
      hasPlantillaItem &&
      hasSalaryGrade &&
      hasStep &&
      hasFTE &&
      hasOffice &&
      hasFunctional &&
      hasJobDesc &&
      hasQualifications
    )
  }, [form.state.values])

  // Notify parent when form dirty state changes
  useEffect(() => {
    isDirtyCallback?.(form.state.isDirty)
  }, [form.state.isDirty, isDirtyCallback])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="title"
          children={(field) => (
            <div className="col-span-2 space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Position Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                placeholder="e.g. Administrative Officer III"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md"
              />
              {field.state.meta.isTouched && !field.state.value && (
                <p className="text-xs text-destructive">Position title is required</p>
              )}
            </div>
          )}
        />

        <form.Field
          name="code"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Position Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                placeholder="e.g. POS-ADM-001"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md"
              />
              {field.state.meta.isTouched && !field.state.value && (
                <p className="text-xs text-destructive">Position code is required</p>
              )}
            </div>
          )}
        />

        <form.Field
          name="type"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Position Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as any)}
              >
                <SelectTrigger className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((opt, idx) => (
                    <SelectItem key={`${opt.id}-${idx}`} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <form.Field
          name="plantillaType"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Plantilla Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as any)}
              >
                <SelectTrigger className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md">
                  <SelectValue placeholder="Select salary grade" />
                </SelectTrigger>
                <SelectContent>
                  {plantillaTypeOptions.map((type, idx) => (
                    <SelectItem key={`${type.id}-${idx}`} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <form.Field
          name="plantillaItem"
          children={(field) => {
            const plantillaType = form.getFieldValue('plantillaType')
            const isOptional = positionConfig.optionalPlantillaTypes.includes(plantillaType as string)
            const isDisabled = isOptional
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                  Plantilla Item {!isOptional && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id={field.name}
                  placeholder={isOptional ? "Not applicable for Job Order/COS" : "e.g. ADM-2024-001"}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isDisabled}
                  className={`h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md ${
                    isDisabled ? 'bg-default-50 text-default-500 cursor-not-allowed' : ''
                  }`}
                />
                {isOptional && (
                  <p className="text-xs text-default-500">Not required for Job Order and COS positions</p>
                )}
              </div>
            )
          }}
        />

        {/* Salary Grade & Step Group */}
        <div className="col-span-2 border border-default-200 rounded-lg p-4 bg-default-50/30 space-y-4">
          <p className="text-xs font-semibold text-default-600 uppercase tracking-wider">Compensation Structure</p>
          
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="salaryGrade"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                    Salary Grade <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={field.state.value?.toString() || ''}
                    onValueChange={(value) => field.handleChange(value ? (parseInt(value) as any) : (undefined as any))}
                  >
                    <SelectTrigger className="h-10 border border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md">
                      <SelectValue placeholder="Select salary grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {salaryGradeOptions.map((grade, idx) => (
                        <SelectItem key={`${grade.id}-${idx}`} value={grade.value.toString()}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            <form.Field
              name="step"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                    Step <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={field.state.value?.toString() || ''}
                    onValueChange={(value) => field.handleChange(value ? (parseInt(value) as any) : (undefined as any))}
                  >
                    <SelectTrigger className="h-10 border border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md">
                      <SelectValue placeholder="Select step" />
                    </SelectTrigger>
                    <SelectContent>
                      {stepOptions.map((step, idx) => (
                        <SelectItem key={`${step.id}-${idx}`} value={step.value.toString()}>
                          {step.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            <form.Field
              name="authorizedFTE"
              children={(field) => {
                const handleFTEChange = (value: string) => {
                  const numValue = value ? parseFloat(value) : undefined
                  return numValue
                }
                return (
                  <div className="space-y-2 w-full col-span-2">
                    <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                      Authorized FTE <span className="text-destructive">*</span>  
                    </Label>
                    <Input
                      id={field.name}
                      type="number"
                      placeholder="e.g. 0.5 or 1.0"
                      min="0.5"
                      step="0.25"
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const numValue = handleFTEChange(e.target.value)
                        if (numValue !== undefined || e.target.value === '') {
                          field.handleChange(numValue as any)
                        }
                      }}
                      className="h-10 border border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md"
                    />
                    <p className="text-xs text-default-500">Full-Time Equivalent (FTE) represents the workload of a position. Enter the number of full-time positions this role represents (e.g., 0.5 for part-time, 1 for full-time, 1.5 for 1.5 positions, 2 for dual positions)</p>
                    {field.state.meta.isTouched && field.state.value !== undefined &&
                      (field.state.value as number) < 0.5 && (
                      <p className="text-xs text-destructive">FTE must be at least 0.5</p>
                    )}
                  </div>
                )
              }}
            />
          </div>
        </div>

        <form.Field
          name="officeId"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Office <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md">
                  <SelectValue placeholder="Select office" />
                </SelectTrigger>
                <SelectContent>
                  {fetchedOrgUnits.map((unit, idx) => (
                    <SelectItem key={`${unit.id}-${idx}`} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.isTouched && !field.state.value && (
                <p className="text-xs text-destructive">Office selection is required</p>
              )}
            </div>
          )}
        />

        <form.Field
          name="functionalTitle"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Functional Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                placeholder="e.g. Budget Officer"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md"
              />
            </div>
          )}
        />

        <form.Field
          name="jobDescription"
          children={(field) => (
            <div className="col-span-2 space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Job Description <span className="text-destructive">*</span>
              </Label>
              <textarea
                id={field.name}
                placeholder="Describe the main responsibilities and duties..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full h-20 px-3 py-2 border border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md resize-none"
              />
            </div>
          )}
        />

        <form.Field
          name="preferredQualifications"
          children={(field) => (
            <div className="col-span-2 space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Qualifications <span className="text-destructive">*</span>
              </Label>
              <textarea
                id={field.name}
                placeholder="Education, experience, skills required..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full h-20 px-3 py-2 border border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md resize-none"
              />
            </div>
          )}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="font-medium h-10 border-default-200 text-default-600 hover:bg-default-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || !isFormValid}
          className="font-semibold h-10 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Position'
          )}
        </Button>
      </div>
    </form>
  )
}

