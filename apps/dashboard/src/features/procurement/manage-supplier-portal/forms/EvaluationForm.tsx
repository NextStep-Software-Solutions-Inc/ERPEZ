/**
 * EvaluationForm Component
 * 
 * TanStack Form + Zod validation for supplier application evaluation
 * Handles:
 * - Status selection (Pending/Passed/Failed)
 * - Optional remarks for rejections
 * - Conditional validation
 * - Unsaved changes detection
 */

import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const evaluationFormSchema = z.object({
  status: z.enum(['Pending', 'Passed', 'Failed']),
  remarks: z.string().max(500, 'Remarks must not exceed 500 characters').optional(),
}).refine(
  (data) => {
    // If status is Failed, remarks should be provided
    if (data.status === 'Failed' && !data.remarks?.trim()) {
      return false
    }
    return true
  },
  {
    message: 'Remarks are required when marking as Failed',
    path: ['remarks'],
  }
)

export type EvaluationFormValues = z.infer<typeof evaluationFormSchema>

interface EvaluationFormProps {
  initialStatus?: string
  initialRemarks?: string
  onSubmit: (values: EvaluationFormValues) => void
  isSubmitting?: boolean
  onDirtyChange?: (isDirty: boolean) => void
}

export function EvaluationForm({
  initialStatus = 'Pending',
  initialRemarks = '',
  onSubmit,
  isSubmitting = false,
  onDirtyChange,
}: EvaluationFormProps) {
  const form = useForm({
    defaultValues: {
      status: initialStatus as 'Pending' | 'Passed' | 'Failed',
      remarks: initialRemarks,
    },
    onSubmit: async ({ value }) => {
      const result = evaluationFormSchema.safeParse(value)
      if (result.success) {
        onSubmit(result.data)
      }
    },
  })

  // Notify parent of dirty state for unsaved changes warning
  const handleFieldChange = (field: keyof EvaluationFormValues, value: unknown) => {
    form.setFieldValue(field as any, value as any)
    if (onDirtyChange && form.state.isDirty) {
      onDirtyChange(true)
    }
  }

  const status = form.state.values.status

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      {/* Status Field */}
      <div className="space-y-2">
        <Label htmlFor="eval-status" className="text-sm font-medium">
          Evaluation Status *
        </Label>
        <Select 
          value={status}
          onValueChange={(value) => handleFieldChange('status', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="eval-status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending Review</SelectItem>
            <SelectItem value="Passed">Passed</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Remarks Field - Show for all, but enforce for Failed */}
      <div className="space-y-2">
        <Label htmlFor="remarks" className="text-sm font-medium">
          Remarks {status === 'Failed' && <span className="text-red-600">*</span>}
        </Label>
        <Textarea
          id="remarks"
          placeholder={
            status === 'Failed'
              ? 'Please provide reasons for rejection (required)...'
              : 'Add optional notes...'
          }
          value={form.state.values.remarks || ''}
          onChange={(e) => handleFieldChange('remarks', e.target.value)}
          disabled={isSubmitting}
          className="min-h-24 resize-none"
          maxLength={500}
        />
        <div className={cn(
          'text-xs text-right',
          (form.state.values.remarks?.length || 0) > 450 ? 'text-amber-600' : 'text-muted-foreground'
        )}>
          {form.state.values.remarks?.length || 0}/500 characters
        </div>
      </div>

      {/* Validation Error */}
      {form.state.errors && Object.keys(form.state.errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-800 font-medium">Please fix the following errors:</p>
          <ul className="text-sm text-red-700 mt-1 space-y-1">
            {Object.entries(form.state.errors).map(([field, error]) => (
              <li key={field}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'flex-1',
            status === 'Passed' && 'bg-emerald-600 hover:bg-emerald-700',
            status === 'Failed' && 'bg-red-600 hover:bg-red-700'
          )}
        >
          {isSubmitting ? 'Saving...' : 'Save Evaluation'}
        </Button>
      </div>
    </form>
  )
}
