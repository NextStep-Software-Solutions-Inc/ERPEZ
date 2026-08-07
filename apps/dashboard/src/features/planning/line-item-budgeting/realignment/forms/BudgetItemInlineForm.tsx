import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import api from '@/services/api'
import type { BudgetItem } from '../types/realignment.types'

const budgetItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  q1: z.coerce.number().min(0, 'Must be at least 0'),
  q2: z.coerce.number().min(0, 'Must be at least 0'),
  q3: z.coerce.number().min(0, 'Must be at least 0'),
  q4: z.coerce.number().min(0, 'Must be at least 0'),
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
        const newBudget = value.q1 + value.q2 + value.q3 + value.q4
        await api.put(`/line-item-budget-details/${bItem.id}`, {
          description: value.description,
          budget: newBudget,
          q1: value.q1,
          q2: value.q2,
          q3: value.q3,
          q4: value.q4,
        })
        toast({
          title: 'Saved Successfully',
          description: 'The line item has been updated.',
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
