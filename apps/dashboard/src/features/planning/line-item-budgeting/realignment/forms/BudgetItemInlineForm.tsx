import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import api from '@/services/api'
import type { BudgetItem } from '../types/realignment.types'

const budgetItemSchema = z
  .object({
    description: z.string().min(1, 'Description is required'),
    q1: z.coerce.number().min(0, 'Must be at least 0'),
    q2: z.coerce.number().min(0, 'Must be at least 0'),
    q3: z.coerce.number().min(0, 'Must be at least 0'),
    q4: z.coerce.number().min(0, 'Must be at least 0'),
  })
  .refine((data) => data.q1 + data.q2 + data.q3 + data.q4 > 0, {
    message: 'Total budget must be greater than 0',
    path: ['q1'],
  })

type BudgetItemFormValues = z.infer<typeof budgetItemSchema>

interface BudgetItemInlineFormProps {
  bItem: BudgetItem
  onSuccess: () => Promise<void>
  onCancel: () => void
}

export function BudgetItemInlineForm({
  bItem,
  onSuccess,
  onCancel,
}: BudgetItemInlineFormProps) {
  const { toast } = useToast()

  const form = useForm<BudgetItemFormValues>({
    defaultValues: {
      description: bItem.description,
      q1: bItem.q1 || 0,
      q2: bItem.q2 || 0,
      q3: bItem.q3 || 0,
      q4: bItem.q4 || 0,
    },
    validators: {
      onChange: budgetItemSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // 1. Fetch the primary detail to obtain full metadata
        const res = await api.get<{ data: any }>(
          `/line-item-budget-details/${bItem.id}`,
        )
        const detail = res.data?.data

        if (!detail) {
          throw new Error('Line item detail not found.')
        }

        // 2. Resolve year and quarterly dates
        const year = detail.startDate
          ? new Date(detail.startDate).getFullYear()
          : new Date().getFullYear()

        const quarterDates: Record<
          'q1' | 'q2' | 'q3' | 'q4',
          { start: string; end: string }
        > = {
          q1: {
            start: `${year}-01-01T00:00:00.000Z`,
            end: `${year}-03-31T00:00:00.000Z`,
          },
          q2: {
            start: `${year}-04-01T00:00:00.000Z`,
            end: `${year}-06-30T00:00:00.000Z`,
          },
          q3: {
            start: `${year}-07-01T00:00:00.000Z`,
            end: `${year}-09-30T00:00:00.000Z`,
          },
          q4: {
            start: `${year}-10-01T00:00:00.000Z`,
            end: `${year}-12-31T00:00:00.000Z`,
          },
        }

        // 3. Resolve existing quarter record IDs
        const existingQuarterIds: Partial<
          Record<'q1' | 'q2' | 'q3' | 'q4', string>
        > = {
          ...bItem.quarterDetailIds,
        }

        // Fallback: if quarterDetailIds is empty, infer the quarter of the primary detail
        if (Object.keys(existingQuarterIds).length === 0) {
          const origMonth = detail.startDate
            ? new Date(detail.startDate).getMonth()
            : -1
          let origKey: 'q1' | 'q2' | 'q3' | 'q4' = 'q1'
          if (origMonth >= 0 && origMonth <= 2) origKey = 'q1'
          else if (origMonth >= 3 && origMonth <= 5) origKey = 'q2'
          else if (origMonth >= 6 && origMonth <= 8) origKey = 'q3'
          else if (origMonth >= 9 && origMonth <= 11) origKey = 'q4'
          existingQuarterIds[origKey] = bItem.id
        }

        const quarterValues: Record<'q1' | 'q2' | 'q3' | 'q4', number> = {
          q1: Number(value.q1) || 0,
          q2: Number(value.q2) || 0,
          q3: Number(value.q3) || 0,
          q4: Number(value.q4) || 0,
        }

        const quarters: Array<'q1' | 'q2' | 'q3' | 'q4'> = [
          'q1',
          'q2',
          'q3',
          'q4',
        ]
        const activeQuarters = quarters.filter((k) => quarterValues[k] > 0)
        const unusedExistingIds: string[] = []

        // Collect existing record IDs whose quarter is now set to 0
        quarters.forEach((k) => {
          const existingId = existingQuarterIds[k]
          if (existingId && quarterValues[k] === 0) {
            unusedExistingIds.push(existingId)
          }
        })

        // Also if bItem.detailIds contains any other legacy duplicate records that were not mapped to a quarter, include them in unused
        if (bItem.detailIds && bItem.detailIds.length > 0) {
          const mappedIds = new Set(
            Object.values(existingQuarterIds).filter(Boolean),
          )
          bItem.detailIds.forEach((id) => {
            if (!mappedIds.has(id) && !unusedExistingIds.includes(id)) {
              unusedExistingIds.push(id)
            }
          })
        }

        const requests: Promise<any>[] = []

        activeQuarters.forEach((qKey) => {
          const qBudget = quarterValues[qKey]
          const dates = quarterDates[qKey]
          const existingId = existingQuarterIds[qKey]

          if (existingId) {
            // Update existing record for this quarter with updated dates & budget
            requests.push(
              api.put(`/line-item-budget-details/${existingId}`, {
                description: value.description,
                budget: qBudget,
                startDate: dates.start,
                endDate: dates.end,
                timelineType: 'Quarterly',
              }),
            )
          } else if (unusedExistingIds.length > 0) {
            // Repurpose an unused record from another quarter to this quarter
            const idToReuse = unusedExistingIds.shift()!
            requests.push(
              api.put(`/line-item-budget-details/${idToReuse}`, {
                description: value.description,
                budget: qBudget,
                startDate: dates.start,
                endDate: dates.end,
                timelineType: 'Quarterly',
              }),
            )
          } else {
            // Create a discrete line item record for this new quarter
            requests.push(
              api.post('/line-item-budget-details', {
                lineItemBudgetId: detail.lineItemBudgetId,
                lineItemBudgetActivityId: detail.lineItemBudgetActivityId,
                objectId: detail.objectId,
                wfpObjectiveActivityExpenditureId:
                  detail.wfpObjectiveActivityExpenditureId || undefined,
                description: value.description,
                unitQuantity: detail.unitQuantity || undefined,
                unitCost: detail.unitCost || undefined,
                timelineType: 'Quarterly',
                startDate: dates.start,
                endDate: dates.end,
                budget: qBudget,
              }),
            )
          }
        })

        // Delete any remaining unused records from quarters that were cleared
        unusedExistingIds.forEach((id) => {
          requests.push(api.delete(`/line-item-budget-details/${id}`))
        })

        await Promise.all(requests)

        toast({
          title: 'Saved Successfully',
          description: 'The line item has been updated across quarters.',
        })
        await onSuccess()
      } catch (err) {
        console.error('Failed to save line item edit:', err)
        toast({
          title: 'Error',
          description: 'Failed to update line item details.',
          variant: 'destructive',
        })
      }
    },
  })

  return (
    <>
      <td className="py-2 font-medium text-slate-800">
        <form.Field
          name="description"
          children={(field) => (
            <div>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="h-7 text-xs bg-white"
              />
              {field.state.meta.errors.length > 0 && (
                <span className="text-[10px] text-red-500">
                  {field.state.meta.errors[0]}
                </span>
              )}
            </div>
          )}
        />
      </td>
      <td className="py-2 text-right w-20">
        <form.Field
          name="q1"
          children={(field) => (
            <Input
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={field.handleBlur}
              className="h-7 text-xs bg-white text-right"
            />
          )}
        />
      </td>
      <td className="py-2 text-right w-20">
        <form.Field
          name="q2"
          children={(field) => (
            <Input
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={field.handleBlur}
              className="h-7 text-xs bg-white text-right"
            />
          )}
        />
      </td>
      <td className="py-2 text-right w-20">
        <form.Field
          name="q3"
          children={(field) => (
            <Input
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={field.handleBlur}
              className="h-7 text-xs bg-white text-right"
            />
          )}
        />
      </td>
      <td className="py-2 text-right w-20">
        <form.Field
          name="q4"
          children={(field) => (
            <Input
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={field.handleBlur}
              className="h-7 text-xs bg-white text-right"
            />
          )}
        />
      </td>
      <td className="py-2 text-right font-bold text-slate-900 w-24 font-mono">
        <form.Subscribe
          selector={(state) => state.values}
          children={(values) => (
            <span>
              ₱
              {(
                values.q1 +
                values.q2 +
                values.q3 +
                values.q4
              ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          )}
        />
      </td>
      <td className="py-2 text-center">
        <div className="flex justify-center gap-1">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-green-600 hover:text-green-800"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  form.handleSubmit()
                }}
                disabled={!canSubmit || isSubmitting}
                title="Save item"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
              </Button>
            )}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-red-600 hover:text-red-800"
            onClick={onCancel}
            title="Cancel editing"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </>
  )
}
