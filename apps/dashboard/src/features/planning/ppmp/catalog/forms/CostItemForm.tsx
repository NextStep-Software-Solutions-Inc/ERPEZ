/**
 * CostItemForm
 * Shared create/edit form for Cost Master items.
 */

import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { costItemFormSchema, type CostItemFormValues } from './CostItemFormSchema'

interface CostItemFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<CostItemFormValues>
  onSubmit: (data: CostItemFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CostItemForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: CostItemFormProps) {
  const form = useForm({
    defaultValues: {
      costItemName: defaultValues?.costItemName ?? '',
      category: defaultValues?.category ?? '',
      subcategory: defaultValues?.subcategory ?? '',
      standardUnitCost: defaultValues?.standardUnitCost ?? 0,
      unitOfMeasure: defaultValues?.unitOfMeasure ?? '',
      description: defaultValues?.description ?? '',
      uacsCode: defaultValues?.uacsCode ?? '',
      isActive: defaultValues?.isActive ?? true,
    } as CostItemFormValues,
    onSubmit: async ({ value }) => {
      const result = costItemFormSchema.safeParse(value)
      if (result.success) {
        onSubmit(result.data)
      } else {
        console.error('Cost item validation failed:', result.error.flatten())
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <form.Field name="costItemName">
        {(field) => (
          <div className="space-y-1.5">
            <Label>
              Cost Item Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. Travel Per Diem - Domestic"
              disabled={isLoading}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="category">
          {(field) => (
            <div className="space-y-1.5">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. Travel"
                disabled={isLoading}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="subcategory">
          {(field) => (
            <div className="space-y-1.5">
              <Label>Subcategory</Label>
              <Input
                value={(field.state.value as string) ?? ''}
                onChange={(e) => field.handleChange(e.target.value || null)}
                placeholder="e.g. Allowances"
                disabled={isLoading}
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="standardUnitCost">
          {(field) => (
            <div className="space-y-1.5">
              <Label>
                Standard Unit Cost (₱) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={field.state.value as number}
                onChange={(e) =>
                  field.handleChange(parseFloat(e.target.value) || 0)
                }
                disabled={isLoading}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="unitOfMeasure">
          {(field) => (
            <div className="space-y-1.5">
              <Label>
                Unit of Measure <span className="text-destructive">*</span>
              </Label>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. person-day"
                disabled={isLoading}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="description">
        {(field) => (
          <div className="space-y-1.5">
            <Label>
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={4}
              placeholder="Describe when this predefined cost should be used..."
              disabled={isLoading}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="uacsCode">
          {(field) => (
            <div className="space-y-1.5">
              <Label>UACS Code</Label>
              <Input
                value={(field.state.value as string) ?? ''}
                onChange={(e) => field.handleChange(e.target.value || null)}
                placeholder="e.g. 50203010"
                disabled={isLoading}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="isActive">
          {(field) => (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(Boolean(checked))
                  }
                  disabled={isLoading}
                />
                <span className="text-sm">
                  {mode === 'create' ? 'Make item active' : 'Active'}
                </span>
              </div>
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {mode === 'create' ? 'Create Cost Item' : 'Update Cost Item'}
        </Button>
      </div>
    </form>
  )
}
