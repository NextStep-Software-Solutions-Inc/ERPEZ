import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { parseUACSFundSource } from '@/utils/uacsFundSource'

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }

  try {
    return new Date(dateString).toISOString().split('T')[0]
  } catch (e) {
    console.error('Invalid date format:', dateString)
    return ''
  }
}

export const updateFundReceivingSchema = z.object({
  fundSourceId: z.string().optional(),
  description: z
    .string()
    .min(1, 'Purpose is required')
    .max(255, 'Purpose must be 255 characters or less'),
  amount: z.preprocess(
    (val) => (val === '' ? null : Number(val)),
    z.union(
      [
        z
          .number({
            error: 'Amount must be a valid number',
          })
          .min(0.01, 'Amount must be greater than zero'),
        z
          .string()
          .regex(
            /^\d+(\.\d{1,2})?$/,
            'Amount must be a valid currency format (e.g., 100.00)',
          ),
      ],
      {
        error: () => ({
          message: 'Amount is required and must be a valid positive number',
        }),
      },
    ),
  ),
  receivedDate: z.string().min(1, 'Received date is required'),
})

export type UpdateFundReceivingFormType = z.infer<
  typeof updateFundReceivingSchema
>

interface FundSource {
  id: string
  name: string
  code: string
  type: string
  isActive: boolean
}

interface UpdateFundReceivingFormProps {
  onSubmit: (data: UpdateFundReceivingFormType) => void
  onCancel: () => void
  initialValues?: Partial<UpdateFundReceivingFormType> & {
    id?: string
    description?: string
    amount?: number | undefined | string
    receivedDate?: string
    FundSource?: FundSource
  }
  isLoading?: boolean
  onValueChange: (fieldName: keyof UpdateFundReceivingFormType, value: any) => void
}

export default function UpdateFundReceivingForm({
  onSubmit,
  onCancel,
  initialValues,
  isLoading = false,
  onValueChange,
}: UpdateFundReceivingFormProps) {
  const defaultValues = useMemo(() => {
    const apiData = initialValues || {}
    return {
      description: apiData.description || '',
      amount: apiData.amount != null ? Number(apiData.amount) : '',
      receivedDate: formatDateForInput(apiData.receivedDate),
    } as UpdateFundReceivingFormType
  }, [initialValues])

  const form = useForm({
    defaultValues: defaultValues,
    onSubmit: async ({ value }) => {
      onSubmit(value)
    },
  })

  const getTodayDateString = (): string => {
    const today = new Date()
    return today.toISOString().slice(0, 10)
  }
  const TODAY_DATE_STRING = getTodayDateString()

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
          name="fundSourceId"
          children={() => {
            const fs = initialValues?.FundSource
            const parsed = parseUACSFundSource(fs?.code || '', fs?.name || '')
            return (
              <div className="grid gap-2">
                <Label htmlFor="fundSourceId">Fund Source</Label>
                <div className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {parsed.code && (
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                          {parsed.code}
                        </span>
                      )}
                      {parsed.authorizationName && (
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${parsed.badge.bg} ${parsed.badge.text} ${parsed.badge.border}`}
                        >
                          {parsed.badge.shortLabel}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-800 mt-1 block">
                      {parsed.name}
                    </span>
                  </div>
                </div>
              </div>
            )
          }}
        />
        <form.Field
          name="amount"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                type="number"
                step="0.01"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  onValueChange('amount', e.target.value)
                }}
              />
            </div>
          )}
        />

        <form.Field
          name="receivedDate"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Received Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                max={TODAY_DATE_STRING}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  onValueChange('receivedDate', e.target.value)
                }}
              />
            </div>
          )}
        />

        <form.Field
          name="description"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Purpose <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  onValueChange('description', e.target.value)
                }}
              />
            </div>
          )}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Fund Receiving
        </Button>
      </div>
    </form>
  )
}