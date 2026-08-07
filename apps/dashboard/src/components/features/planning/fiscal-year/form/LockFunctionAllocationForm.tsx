import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Lock } from 'lucide-react'
import type { FiscalYear } from '../table/types'
import { Button } from '@/components/ui/button'
import SubmitButton from '@/components/SubmitButton'

// Payload schema for the lock operation
export const lockFunctionAllocationSchema = z.object({
  fiscalYearIds: z.array(z.string()),
})

export type LockFunctionAllocationType = z.infer<
  typeof lockFunctionAllocationSchema
>

// Form data type
export type LockFunctionAllocationFormType = {
  selectedRows: Array<FiscalYear>
}
type FormType = ReturnType<typeof createFormFactory>

interface LockFunctionAllocationFormProps {
  selectedRows: Array<FiscalYear>
  onSubmit: (data: LockFunctionAllocationType) => void
  onCancel: (form: FormType) => void
  isLoading?: boolean
}

const createFormFactory = ({
  onSubmit,
  selectedRows,
}: {
  onSubmit: (data: LockFunctionAllocationType) => void
  selectedRows: Array<FiscalYear>
}) =>
  useForm({
    defaultValues: {
      selectedRows,
    },
    onSubmit: (values) => {
      const fiscalYearIds = values.value.selectedRows.map((row) => row.id)
      const payload: LockFunctionAllocationType = {
        fiscalYearIds,
      }
      onSubmit(payload)
    },
  })

export default function LockFunctionAllocationForm({
  selectedRows,
  onSubmit,
  onCancel,
  isLoading = false,
}: LockFunctionAllocationFormProps) {
  const form = createFormFactory({ onSubmit, selectedRows })
  const handleCancel = () => {
    onCancel(form)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          You are about to lock the following fiscal year allocations:
        </div>

        <div className="border rounded-lg p-4 space-y-3">
          {selectedRows.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded"
            >
              <div className="flex-1">
                <div className="font-medium">{row.fiscalYear}</div>
                <div className="text-sm text-muted-foreground">
                  Core Function: {row.coreFunction}% | Strategic Priority:{' '}
                  {row.strategicPriority}% | Mandatory Support:{' '}
                  {row.mandatorySupportFunction}%
                </div>
              </div>
              <div className="text-sm font-medium text-orange-600">
                Status: {row.status}
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          Locking these allocations will prevent further modifications. This
          action cannot be undone.
        </div>
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
        <SubmitButton
          type="submit"
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Lock className="w-4 h-4 mr-1" />
          Lock Selected Allocations
        </SubmitButton>
      </div>
    </form>
  )
}
