import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { format, parseISO, startOfToday } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { z } from 'zod'
import {
  MOCK_HOLIDAYS_2026,
  PROCUREMENT_CATEGORY_LABELS,
} from '../data/mockBiddingScheduleData'
import { buildDisabledMatcher } from '../utils/dateHelpers'
import type { ProcurementCategory } from '../types'
import FieldInfo from '@/components/FieldInfo'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const generateScheduleSchema = z.object({
  ibPostingDate: z.string().min(1, 'IB Posting Date is required.'),
  procurementCategory: z.enum(['goods', 'infrastructure', 'consulting'], {
    message: 'Procurement category is required.',
  }),
})

export type GenerateScheduleFormValues = z.infer<typeof generateScheduleSchema>

interface GenerateScheduleFormProps {
  onSubmit: (values: GenerateScheduleFormValues) => Promise<void> | void
  initialValues?: Partial<GenerateScheduleFormValues>
  isLoading?: boolean
  onDirtyChange?: (isDirty: boolean) => void
  formId?: string
}

export function GenerateScheduleForm({
  onSubmit,
  initialValues,
  isLoading = false,
  onDirtyChange,
  formId,
}: GenerateScheduleFormProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const disabledMatcher = buildDisabledMatcher(
    startOfToday(),
    MOCK_HOLIDAYS_2026,
  )

  const form = useForm({
    defaultValues: {
      ibPostingDate: initialValues?.ibPostingDate ?? '',
      procurementCategory: (initialValues?.procurementCategory ?? '') as
        | ProcurementCategory
        | '',
    },
    validators: {
      onSubmit: generateScheduleSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as GenerateScheduleFormValues)
      onDirtyChange?.(false)
    },
  })

  useEffect(() => {
    onDirtyChange?.(form.state.isDirty)
  }, [form.state.isDirty, onDirtyChange])

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      {/* IB Posting Date */}
      <form.Field name="ibPostingDate">
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor="ibPostingDate-trigger">IB Posting Date</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="ibPostingDate-trigger"
                  variant="outline"
                  type="button"
                  className="w-full justify-start text-left font-normal"
                  disabled={isLoading}
                  onBlur={field.handleBlur}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.state.value
                    ? format(parseISO(field.state.value), 'PPP')
                    : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    field.state.value ? parseISO(field.state.value) : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      field.handleChange(format(date, 'yyyy-MM-dd'))
                      setDatePickerOpen(false)
                    }
                  }}
                  disabled={disabledMatcher}
                />
              </PopoverContent>
            </Popover>
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      {/* Procurement Category */}
      <form.Field name="procurementCategory">
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor="procurementCategory-trigger">
              Procurement Category
            </Label>
            <Select
              value={field.state.value || undefined}
              onValueChange={(val) =>
                field.handleChange(val as ProcurementCategory)
              }
              disabled={isLoading}
            >
              <SelectTrigger
                id="procurementCategory-trigger"
                onBlur={field.handleBlur}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(PROCUREMENT_CATEGORY_LABELS) as Array<
                    [ProcurementCategory, string]
                  >
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>
    </form>
  )
}
