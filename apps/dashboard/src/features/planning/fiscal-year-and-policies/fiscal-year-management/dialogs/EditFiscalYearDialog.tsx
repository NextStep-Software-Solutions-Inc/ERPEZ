import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types'
import {
  FiscalYearForm,
  type FiscalYearFormValues,
} from '../forms/FiscalYearForm'

interface EditFiscalYearDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fiscalYear: FiscalYear | null
  onUpdate: (values: FiscalYearFormValues) => void
  isLoading?: boolean
  existingYears: FiscalYear[]
}

/**
 * Dialog for editing an existing fiscal year.
 * Uses FiscalYearForm with initial values and ResponsiveDialogDashtail's footer for actions.
 */
export function EditFiscalYearDialog({
  open,
  onOpenChange,
  fiscalYear,
  onUpdate,
  isLoading = false,
  existingYears,
}: EditFiscalYearDialogProps) {
  if (!fiscalYear) return null

  const formId = `edit-fiscal-year-form-${fiscalYear.id}`

  const footer = (
    <div className="flex w-full justify-end gap-3">
      <Button
        variant="outline"
        type="button"
        onClick={() => onOpenChange(false)}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button type="submit" form={formId} disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update'}
      </Button>
    </div>
  )

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Fiscal Year"
      description="Update the year or description of this fiscal year."
      size="md"
      footer={footer}
    >
      <FiscalYearForm
        formId={formId}
        initialValues={{
          year: fiscalYear.year,
          description: fiscalYear.description || '',
        }}
        onSubmit={onUpdate}
        isLoading={isLoading}
        existingYears={existingYears}
        fiscalYearId={fiscalYear.id}
      />
    </ResponsiveDialogDashtail>
  )
}
