import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Save } from 'lucide-react'
import { useState } from 'react'
import type { KpiAssignment } from '../table/types'
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
import { Textarea } from '@/components/ui/textarea'
import SubmitButton from '@/components/SubmitButton'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

// Schema for KPI Assignment update
export const updateKpiAssignmentSchema = z.object({
  deliveryUnitId: z.string().min(1, 'Delivery Unit is required'),
  kpiId: z.string().min(1, 'KPI is required'),
  targetValue: z.number().min(0, 'Target value must be 0 or greater'),
  description: z.string(),
  deadline: z.string().min(1, 'Deadline is required'),
  priority: z.enum(['High', 'Medium', 'Low']),
})

export type UpdateKpiAssignmentFormValues = z.infer<
  typeof updateKpiAssignmentSchema
>

export type UpdateKpiAssignmentFormType = UpdateKpiAssignmentFormValues

interface UpdateKpiAssignmentFormProps {
  onSubmit: (data: UpdateKpiAssignmentFormValues) => void
  onCancel: () => void
  initialValues: KpiAssignment
  isLoading?: boolean
}

export default function UpdateKpiAssignmentForm({
  onSubmit,
  onCancel,
  initialValues,
  isLoading = false,
}: UpdateKpiAssignmentFormProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [pendingClose, setPendingClose] = useState<(() => void) | null>(null)

  const form = useForm({
    defaultValues: {
      deliveryUnitId: initialValues.deliveryUnit || '',
      kpiId: initialValues.KPI?.[0]?.id || '',
      targetValue: (initialValues as any).targetValue || 0,
      description: initialValues.description || '',
      deadline: (initialValues as any).deadline || '',
      priority: (initialValues.priority || 'Medium') as
        | 'High'
        | 'Medium'
        | 'Low',
    },
    onSubmit: async ({ value }) => {
      onSubmit(value)
    },
  })

  const handleConfirmDiscard = () => {
    if (pendingClose) {
      pendingClose()
      setPendingClose(null)
    }
    setShowUnsavedWarning(false)
  }

  const handleCancel = () => {
    if (form.state.isDirty) {
      setPendingClose(() => () => {
        form.reset()
        onCancel()
      })
      setShowUnsavedWarning(true)
    } else {
      form.reset()
      onCancel()
    }
  }

  return (
    <>
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
            name="deliveryUnitId"
            validators={{
              onChange: z.string().min(1, 'Delivery Unit is required'),
            }}
            children={(field) => (
              <>
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>
                    Delivery Unit <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      className={
                        field.state.meta.errors.length > 0
                          ? 'border-destructive'
                          : ''
                      }
                      onBlur={field.handleBlur}
                    >
                      <SelectValue placeholder="Select Delivery Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="du-1">Delivery Unit 1</SelectItem>
                      <SelectItem value="du-2">Delivery Unit 2</SelectItem>
                      <SelectItem value="du-3">Delivery Unit 3</SelectItem>
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

          <form.Field
            name="kpiId"
            validators={{
              onChange: z.string().min(1, 'KPI is required'),
            }}
            children={(field) => (
              <>
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>
                    KPI <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      className={
                        field.state.meta.errors.length > 0
                          ? 'border-destructive'
                          : ''
                      }
                      onBlur={field.handleBlur}
                    >
                      <SelectValue placeholder="Select KPI" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kpi-1">
                        Customer Satisfaction Score
                      </SelectItem>
                      <SelectItem value="kpi-2">Revenue Growth Rate</SelectItem>
                      <SelectItem value="kpi-3">
                        Employee Productivity
                      </SelectItem>
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

          <form.Field
            name="targetValue"
            validators={{
              onChange: z.number().min(0, 'Target value must be 0 or greater'),
            }}
            children={(field) => (
              <>
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>
                    Target Value <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    type="number"
                    min="0"
                    step="0.01"
                    value={field.state.value || ''}
                    onChange={(e) =>
                      field.handleChange(Number(e.target.value) || 0)
                    }
                    onBlur={field.handleBlur}
                    placeholder="Enter target value"
                    disabled={isLoading}
                    className={
                      field.state.meta.errors.length > 0
                        ? 'border-destructive'
                        : ''
                    }
                  />
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
            name="deadline"
            validators={{
              onChange: z.string().min(1, 'Deadline is required'),
            }}
            children={(field) => (
              <>
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>
                    Deadline <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                    className={
                      field.state.meta.errors.length > 0
                        ? 'border-destructive'
                        : ''
                    }
                  />
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
            name="priority"
            validators={{
              onChange: z.enum(['High', 'Medium', 'Low']),
            }}
            children={(field) => (
              <>
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>
                    Priority <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as 'High' | 'Medium' | 'Low')
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      className={
                        field.state.meta.errors.length > 0
                          ? 'border-destructive'
                          : ''
                      }
                      onBlur={field.handleBlur}
                    >
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
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

          <form.Field
            name="description"
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Description</Label>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Enter assignment description"
                  disabled={isLoading}
                  rows={3}
                />
              </div>
            )}
          />
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
          <SubmitButton type="submit" loading={isLoading}>
            <Save className="w-4 h-4 mr-1" />
            Update KPI Assignment
          </SubmitButton>
        </div>
      </form>

      {showUnsavedWarning && (
        <ConfirmAlertDialog
          open={showUnsavedWarning}
          onOpenChange={setShowUnsavedWarning}
          title="Unsaved Changes"
          description="You have unsaved changes that will be lost. Are you sure you want to continue?"
          onConfirm={handleConfirmDiscard}
          confirmLabel="Discard Changes"
          cancelLabel="Keep Editing"
        />
      )}
    </>
  )
}
