import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useMemo } from 'react'
import { getFiscalYearsRequest } from '../../fiscal-year/handlers/getFiscalYearsRequest'
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
import SubmitButton from '@/components/SubmitButton'

// Schema for FunctionAllocation creation
export const upsertFunctionAllocationSchema = z
  .object({
    yearId: z.string().min(1, 'Fiscal year is required'),
    functionAllocations: z
      .array(
        z.object({
          id: z.string().optional(),
          functionType: z.enum([
            'CoreFunction',
            'StrategicPriority',
            'MandatorySupport',
          ]),
          percentage: z
            .number()
            .min(0, 'Must be between 0 and 100')
            .max(100, 'Must be between 0 and 100'),
        }),
      )
      .min(1, 'At least one function allocation is required'),
  })
  .refine(
    (data) => {
      const total = data.functionAllocations.reduce(
        (sum, alloc) => sum + alloc.percentage,
        0,
      )
      return total === 100
    },
    {
      message: 'Total percentage of function allocations must equal 100%.',
      path: ['functionAllocations'],
    },
  )
  .refine(
    (data) => {
      const mandatorySupport = data.functionAllocations.find(
        (alloc) => alloc.functionType === 'MandatorySupport',
      )
      return mandatorySupport && mandatorySupport.percentage >= 1
    },
    {
      message: 'Mandatory Support must be included and must be at least 1%.',
      path: ['functionAllocations'],
    },
  )

export type UpsertFunctionAllocationType = z.infer<
  typeof upsertFunctionAllocationSchema
>

export type UpsertFunctionAllocationFormType = {
  yearId: string
  description?: string
  functionAllocations: Array<{
    id?: string
    functionType: 'CoreFunction' | 'StrategicPriority' | 'MandatorySupport'
    percentage: number
  }>
}
interface FunctionAllocationFormConfig {
  onSubmit: (data: UpsertFunctionAllocationType) => void
  initialValues?: Partial<UpsertFunctionAllocationFormType>
}
const createFormFactory = ({
  onSubmit,
  initialValues,
  isEdit,
  fiscalYearId,
}: FunctionAllocationFormConfig & {
  isEdit?: boolean
  fiscalYearId?: string
}) =>
  useForm({
    defaultValues: {
      yearId: isEdit && fiscalYearId ? fiscalYearId : '',
      functionAllocations: [
        { functionType: 'StrategicPriority' as const, percentage: 0, id: undefined },
        { functionType: 'CoreFunction' as const, percentage: 0, id: undefined },
        { functionType: 'MandatorySupport' as const, percentage: 0, id: undefined },
      ],
      ...initialValues,
    },
    onSubmit: (values) => {
      // Filter out allocations with 0 percentage, but always keep Mandatory Support
      const validAllocations = values.value.functionAllocations.filter(
        (alloc) =>
          alloc.percentage > 0 || alloc.functionType === 'MandatorySupport',
      )

      const payload: UpsertFunctionAllocationType = {
        yearId: values.value.yearId,
        functionAllocations: validAllocations,
      }

      onSubmit(payload)
    },
  })
type FormType = ReturnType<typeof createFormFactory>

interface UpsertFunctionAllocationFormProps {
  onSubmit: (data: UpsertFunctionAllocationType) => void
  onCancel: (form: FormType) => void
  initialValues?: Partial<UpsertFunctionAllocationFormType>
  isLoading?: boolean
  isEdit?: boolean
  fiscalYearId?: string
}

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)

export default function UpsertFunctionAllocationForm({
  onSubmit,
  onCancel,
  initialValues,
  isLoading = false,
  isEdit = false,
  fiscalYearId,
}: UpsertFunctionAllocationFormProps) {
  // Prepare merged initial values to ensure all 3 function types are present
  const defaultAllocations = [
    { functionType: 'StrategicPriority' as const, percentage: 0, id: undefined },
    { functionType: 'CoreFunction' as const, percentage: 0, id: undefined },
    { functionType: 'MandatorySupport' as const, percentage: 0, id: undefined },
  ]

  const mergedAllocations = defaultAllocations.map(defaultAlloc => {
    const existing = initialValues?.functionAllocations?.find(
      alloc => alloc.functionType === defaultAlloc.functionType
    )
    return existing ? { ...existing } : defaultAlloc
  })

  const preparedInitialValues = {
    ...initialValues,
    functionAllocations: mergedAllocations,
  }

  const form = createFormFactory({
    onSubmit,
    initialValues: preparedInitialValues,
    isEdit,
    fiscalYearId,
  })
  const { data: fiscalYears } = useFiscalYears({
    pathParams: {},
    queryParams: { pageSize: 100, pageNumber: 1 },
  })

  const years = useMemo(() => {
    return (
      fiscalYears?.data
        .filter((fy) =>
          isEdit ? fy.id === fiscalYearId : fy.functionAllocations.length === 0,
        )
        .map((fy) => ({ yearId: fy.id, year: fy.year }))
        .sort((a, b) => b.year - a.year) ?? []
    )
  }, [fiscalYears])

  const handleCancel = () => {
    onCancel(form)
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <div className="grid gap-4">
        <form.Field
          name="yearId"
          validators={{
            onChange: z.string().min(1, 'Fiscal year is required'),
          }}
          children={(field) => (
            <>
              <div className="grid gap-2">
                <Label htmlFor={field.name}>
                  Fiscal Year <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                  disabled={isLoading || isEdit || years.length === 0}
                >
                  <SelectTrigger
                    className={
                      field.state.meta.errors.length > 0
                        ? 'border-destructive'
                        : ''
                    }
                    onBlur={field.handleBlur}
                  >
                    <SelectValue placeholder={years.length === 0 ? "No fiscal year available" : "Select Fiscal Year"} />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.yearId} value={year.yearId}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]?.message || 'Invalid value'}
                </p>
              )}
            </>
          )}
        />

        <div className="grid gap-2"> 
          <div className="flex flex-row items-center gap-6">
            <Label
              className='flex-1'
            >
              KPI Function <span className="text-destructive">*</span>
            </Label>
            <Label
              className='flex-1'
            >
              Percentage <span className="text-destructive">*</span>
            </Label>
          </div>
          <div className="grid space-y-4 gap-2">
            <form.Field
              name="functionAllocations[1].percentage"
              validators={{
                onChange: z
                  .number()
                  .min(0, 'Must be between 0 and 100')
                  .max(100, 'Must be between 0 and 100'),
              }}
              children={(field) => (
                <>
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <Label
                        htmlFor={String(field.name)}
                        className={`flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ${field.state.meta.errors.length > 0 ? 'border-destructive' : ''}`}
                      >
                        Core Function
                      </Label>
                    </div>
                    <div className="flex-1 flex items-center">
                      <Input
                        id={`${String(field.name)}-percent`}
                        name={String(field.name)}
                        value={String(field.state.value || '')}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(Number(e.target.value) || 0)
                        }}
                        placeholder="%"
                        disabled={isLoading}
                        className="w-full text-right"
                        type="number"
                        min="0"
                        max="100"
                      /> 
                    </div>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]?.message || 'Invalid value'}
                    </p>
                  )}
                </>
              )}
            />

            <form.Field
              name="functionAllocations[0].percentage"
              validators={{
                onChange: z
                  .number()
                  .min(0, 'Must be between 0 and 100')
                  .max(100, 'Must be between 0 and 100'),
              }}
              children={(field) => (
                <>
                  <div className="grid grid-cols-2 items-center gap-6">
                    <div className="flex-1">

                      <Label
                        htmlFor={String(field.name)}
                        className={`flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ${field.state.meta.errors.length > 0 ? 'border-destructive' : ''}`}
                      >
                        Strategic Priority
                      </Label>
                    </div>
                    <div className="flex-1 flex items-center">
                      <Input
                        id={`${String(field.name)}-percent`}
                        name={String(field.name)}
                        value={String(field.state.value || '')}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(Number(e.target.value) || 0)
                        }}
                        placeholder="%"
                        disabled={isLoading}
                        className="w-full text-right"
                        type="number"
                        min="0"
                        max="100"
                      /> 
                    </div>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]?.message || 'Invalid value'}
                    </p>
                  )}
                </>
              )}
            />



            <form.Field
              name="functionAllocations[2].percentage"
              validators={{
                onChange: z
                  .number()
                  .min(1, 'Mandatory Support must be at least 1%')
                  .max(100, 'Must be between 1 and 100'),
              }}
              children={(field) => (
                <>
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <Label
                        htmlFor={String(field.name)}
                        className={`flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ${field.state.meta.errors.length > 0 ? 'border-destructive' : ''}`}
                      >
                        Mandatory Support
                      </Label>
                    </div>
                    <div className="flex-1 flex items-center">
                      <Input
                        id={`${String(field.name)}-percent`}
                        name={String(field.name)}
                        value={String(field.state.value || '')}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(Number(e.target.value) || 0)
                        }}
                        placeholder="%"
                        disabled={isLoading}
                        className="w-full text-right"
                        type="number"
                        min="1"
                        max="100"
                      /> 
                    </div>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]?.message || 'Invalid value'}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          {/* Real-time total allocation display using form.Subscribe */}
          <form.Subscribe
            selector={(state) => {
              return state.values.functionAllocations.reduce(
                (sum, alloc) => sum + alloc.percentage,
                0,
              )
            }}
          >
            {(total) => {
              return (
                <div className="flex justify-between items-center mt-2 space-y-1">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-sm text-muted-foreground">
                      Total Allocation:
                    </span>
                    <span
                      className={`text-sm font-medium ${total === 100
                        ? 'text-green-600'
                        : total > 100
                          ? 'text-red-600'
                          : 'text-yellow-600'
                        }`}
                    >
                      {total}%
                    </span>
                  </div>

                </div>
              )
            }}
          </form.Subscribe>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => ({
            yearId: state.values.yearId,
            total: state.values.functionAllocations.reduce(
              (sum, alloc) => sum + alloc.percentage,
              0,
            ),
          })}
        >
          {({ yearId, total }) => (
            <SubmitButton
              type="submit"
              className="bg-(--button-green)"
              disabled={!yearId || total !== 100}
            >
              <Plus className="w-4 h-4 mr-1" />
              {isEdit ? 'Update Function Allocation' : 'Create Function Allocation'}
            </SubmitButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
