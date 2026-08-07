import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
// import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types'
import type { FiscalYear } from '../types/types'
import {
  FiscalYearForm,
  type FiscalYearFormValues,
} from '../forms/FiscalYearForm'

interface CreateFiscalYearDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (values: FiscalYearFormValues) => void
  isLoading?: boolean
  existingYears: FiscalYear[]
}

/**
 * Dialog for creating a new fiscal year.
 * Uses FiscalYearForm for the underlying data entry and ResponsiveDialogDashtail's footer for actions.
 */
export function CreateFiscalYearDialog({
  open,
  onOpenChange,
  onCreate,
  isLoading = false,
  existingYears,
}: CreateFiscalYearDialogProps) {
  const formId = 'create-fiscal-year-form'

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
        {isLoading ? 'Creating...' : 'Create'}
      </Button>
    </div>
  )

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Fiscal Year"
      description="Enter the year and optional description. 12 months will be created automatically."
      size="md"
      footer={footer}
    >
      <FiscalYearForm
        formId={formId}
        onSubmit={onCreate}
        isLoading={isLoading}
        existingYears={existingYears}
      />
    </ResponsiveDialogDashtail>
  )
}
