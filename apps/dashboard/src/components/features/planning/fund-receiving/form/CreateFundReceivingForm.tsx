import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Loader2, Plus, X } from 'lucide-react'
import { useAtom } from 'jotai'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useEffect } from 'react'
import { createFormDataAtom } from '../atoms'
import { getFundSourcesRequest } from '../handlers/getFundSourcesRequest'
import type { FundReceiving } from '../table/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getTodayDateString, toTitleCase } from '@/utils/formatters'

const useFundSources = createQueryHookFromTemplate(getFundSourcesRequest)

export const createFundReceivingSchema = z.object({
  fundSourceId: z
    .string({
      error: 'Fund source ID is required',
    })
    .uuid('Fund source ID must be a valid UUID'),

  amount: z.preprocess(
    (val) => (val === '' ? null : Number(val)),
    z.union(
      [
        z.number().min(0, 'Amount must be greater than or equal to zero'),
        z
          .string()
          .regex(
            /^\d+(\.\d{1,2})?$/,
            'Must be a valid currency format (e.g., 100.00)',
          ),
      ],
      {
        error: () => ({
          message: 'Amount is required and must be a valid positive number',
        }),
      },
    ),
  ),

  receivedDate: z
    .string({
      error: 'Received Date is required',
    })
    .min(1, 'Received Date is required')
    .refine(
      (value) => {
        const selectedDate = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return selectedDate <= today
      },
      {
        message: 'Received Date cannot be in the future.',
      },
    ),

  description: z.string().optional().default(''),
})

export type CreateFundReceivingFormValues = z.infer<
  typeof createFundReceivingSchema
>
export type CreateFundReceivingType = CreateFundReceivingFormValues
export type CreateFundReceivingFormType = Omit<FundReceiving, 'id'>

interface CreateFundReceivingFormProps {
  onSubmit: (data: CreateFundReceivingFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  initialValues?: Partial<CreateFundReceivingFormValues>
  currentMode: 'create' | 'add'
}

interface FundReceivingFormConfig {
  onSubmit: (data: CreateFundReceivingType) => void
  initialValues?: Partial<CreateFundReceivingFormType>
}
const createFormFactory = ({
  onSubmit,
  initialValues,
}: FundReceivingFormConfig) =>
  useForm({
    defaultValues: {
      amount: 0,
      fundSourceId: '',
      receivedDate: '',
      description: '',
      ...initialValues,
    },
    onSubmit: (values) => {
      const rawDateString = values.value.receivedDate
      const isoDateString = rawDateString
        ? new Date(rawDateString).toISOString()
        : ''

      const payload: CreateFundReceivingType = {
        fundSourceId: values.value.fundSourceId,
        amount: values.value.amount as number,
        receivedDate: isoDateString,
        description: values.value.description,
      }

      onSubmit(payload)
    },
  })

export default function CreateFundReceivingForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialValues = {},
  currentMode,
}: CreateFundReceivingFormProps) {
  const [formData, setFormData] = useAtom(createFormDataAtom)
  const isFundSourceDisabled = currentMode === 'add'
  const {
    data: response,
    isLoading: isLoadingSources,
    error: errorSources,
  } = useFundSources({
    pathParams: { },
    queryParams: {pageSize: 100, pageNumber: 1},
  })

  const fundSourcesData = response?.data || []
  const fundSourcesList = Array.isArray(fundSourcesData) ? fundSourcesData : []
  const activeFundSourcesList = fundSourcesList.filter(
    (source) => source.isActive,
  )
  const form = createFormFactory({
    onSubmit,
    initialValues: {
      amount: 0,
      receivedDate: '',
      description: '',
      fundSourceId: initialValues.fundSourceId || '',
      ...initialValues,
      ...formData,
    },
  })

  useEffect(() => {
    if (currentMode === 'add' && initialValues.fundSourceId) {
      form.setFieldValue('fundSourceId', initialValues.fundSourceId)
    }
  }, [currentMode, initialValues.fundSourceId])

  const handleCancel = () => {
    onCancel()
  }

  const updateFormData = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value })
  }

  const TODAY_DATE_STRING = getTodayDateString()
  const isSubmitting = isLoading || form.state.isSubmitting

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-1">
        <form.Field
          name="fundSourceId"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name} className="text-gray-700">
                Fund Source <span className="text-red-500">*</span>
              </Label>
              {currentMode === 'add' && initialValues.fundSourceId ? (
                <div className="flex flex-col gap-2">
                  <span
                    className="block w-full h-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 text-gray-700 cursor-default"
                    aria-readonly="true"
                  >
                    {toTitleCase(
                      fundSourcesList.find(
                        (source) => source.id === initialValues.fundSourceId,
                      )?.name || initialValues.fundSourceId,
                    )}
                  </span>
                  <input
                    type="hidden"
                    name={field.name}
                    value={initialValues.fundSourceId}
                  />
                </div>
              ) : isLoadingSources ? (
                <span className="text-sm text-blue-500 flex items-center h-10 px-3 border border-blue-200 rounded-lg bg-blue-50 animate-pulse">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading fund
                  sources...
                </span>
              ) : errorSources ? (
                <span className="text-sm text-red-600 flex items-center h-10 px-3 border border-red-300 rounded-lg bg-red-50">
                  <X className="w-4 h-4 mr-2" /> Error loading fund sources.
                </span>
              ) : (
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    updateFormData('fundSourceId', e.target.value)
                  }}
                  disabled={
                    isSubmitting ||
                    fundSourcesList.length === 0 ||
                    isFundSourceDisabled
                  }
                  className={`
                    block w-full h-10 px-3 py-1 border rounded-lg shadow-sm bg-white
                    focus:outline-none transition duration-150 ease-in-out appearance-none
                    ${
                      field.state.meta.errors.length > 0
                        ? 'border-red-500 ring-red-500 focus:ring-1'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }
                    ${isSubmitting || activeFundSourcesList.length === 0 || isFundSourceDisabled ? 'cursor-not-allowed opacity-70 bg-gray-100' : ''}
                  `}
                >
                  <option value="" disabled>
                    Select Fund Source
                  </option>
                  {activeFundSourcesList.map((source) => (
                    <option key={source.id} value={source.id}>
                      {toTitleCase(source.name)}
                    </option>
                  ))}
                </select>
              )}

              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-500 pt-1">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        />

        <form.Field
          name="amount"
          validators={{
            onChange: ({ value }) => {
              const result = z
                .union([
                  z
                    .number()
                    .min(0, 'Amount must be greater than or equal to zero'),
                  z
                    .string()
                    .regex(
                      /^\d+(\.\d{1,2})?$/,
                      'Must be a valid currency format (e.g., 100.00)',
                    ),
                ])
                .safeParse(value)

              return result.success
                ? undefined
                : result.error.issues[0]?.message ||
                    'Amount is required and must be valid'
            },
          }}
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  const rawValue = e.target.value
                  field.handleChange(rawValue)

                  let valueToStore: number | string

                  if (rawValue === '' || rawValue === '.') {
                    valueToStore = rawValue
                  } else {
                    valueToStore = parseFloat(rawValue)
                  }

                  updateFormData('amount', valueToStore)
                }}
                placeholder="Enter amount (e.g., 1000.00)"
                disabled={isLoading}
                className={
                  field.state.meta.errors.length > 0 ? 'border-destructive' : ''
                }
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        />

        <form.Field
          name="receivedDate"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Date Received <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="date"
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  updateFormData('receivedDate', e.target.value)
                }}
                max={TODAY_DATE_STRING}
                disabled={isLoading}
                className={
                  field.state.meta.errors.length > 0 ? 'border-destructive' : ''
                }
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        />

        <div className="hidden md:block"></div>
      </div>

      <form.Field
          name="description"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Purpose
              </Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  updateFormData('description', e.target.value);
                }}
                placeholder="Enter purpose for the received fund"
                disabled={isLoading}
                className={
                  field.state.meta.errors.length > 0 ? 'border-destructive' : ''
                }
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        />

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-(--button-green)">
          <Plus className="w-4 h-4 mr-1" />
          {currentMode === 'add' ? 'Add Received Fund' : 'Create Received Fund'}
        </Button>
      </div>
    </form>
  )
}
