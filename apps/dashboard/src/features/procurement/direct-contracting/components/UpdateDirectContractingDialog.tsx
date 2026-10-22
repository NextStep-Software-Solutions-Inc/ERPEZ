import { useState } from 'react'
import { Loader2, ShoppingCart } from 'lucide-react'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { toast } from 'sonner'
import { useDirectContracting } from '../handlers/hooks'
import {
  
  updateDirectContractingRequest
} from '../handlers/updateDirectContractingRequest'
import {
  
  DirectContractingForm
} from './DirectContractingForm'
import type {UpdateDirectContractingPayload} from '../handlers/updateDirectContractingRequest';
import type {CreateDirectContractingFormValues} from './DirectContractingForm';
import { useSuppliers } from '@/components/features/planning/procurement-library'
import { useBacResolutions } from '@/features/procurement/bac-resolution/handlers/hooks'
import { Button } from '@/components/ui/button'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'

const useUpdateDirectContracting = createMutationHookFromTemplate(
  updateDirectContractingRequest,
)
export interface UpdateDirectContractingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editEntryId: string
  trigger?: React.ReactNode
}

export function UpdateDirectContractingDialog({
  open,
  onOpenChange,
  editEntryId,
  trigger,
}: UpdateDirectContractingDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: updateDirectContracting, isPending: isUpdating } = useUpdateDirectContracting()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Query entry detail
  const { data: entryResponse, isLoading: isLoadingEntry } = useDirectContracting({
    pathParams: { id: editEntryId },
    enabled: open && !!editEntryId,
  })
  const entryData = entryResponse?.data


  // Resolution options
  const { data: bacResolutions } = useBacResolutions({
    pathParams: {},
    queryParams: { pageSize: 200 },
    enabled: open,
  })

  // Suppliers list
  const { data: suppliers } = useSuppliers({
    pathParams: {},
    queryParams: {
      pageSize: 200,
      filters: 'Status==Approved,IsBlacklisted==false',
    },
    enabled: open,
  })

  const handleSubmit = async (values: CreateDirectContractingFormValues) => {
    try {
      setIsSubmitting(true)

      let formattedDeadline = values.submissionDeadline
      if (formattedDeadline && !formattedDeadline.includes('T')) {
        const [year, month, day] = formattedDeadline.split('-').map(Number)
        if (year && month && day) {
          formattedDeadline = new Date(Date.UTC(year, month - 1, day, 23, 59, 59)).toISOString()
        } else {
          formattedDeadline = new Date(formattedDeadline).toISOString()
        }
      } else if (formattedDeadline) {
        formattedDeadline = new Date(formattedDeadline).toISOString()
      }

      const payload: UpdateDirectContractingPayload = {
        name: values.name.trim(),
        exclusiveSupplierId: values.exclusiveSupplierId,
        submissionDeadline: formattedDeadline,
      }

      await toast.promise(
        updateDirectContracting({
          pathParams: { id: editEntryId },
          payload,
        },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].includes('direct-contracting'),
              })
            },
          },
        ),
      )



      onOpenChange(false)
    } catch {
      // toast.promise handles presentation
    } finally {
      setIsSubmitting(false)
    }
  }


  const isBusy = isSubmitting || isUpdating

  return (
    <>
      <ResponsiveDialogDashtail
        open={open}
        onOpenChange={(nextOpen) => {
          if (!isBusy) onOpenChange(nextOpen)
        }}
        title="Edit Direct Contracting Request"
        description="Modify the details or exclusive supplier assignment for this Direct Contracting request."
        size="lg"
        className="w-full max-h-[85vh]"
        trigger={trigger}
        footer={
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="update-direct-contracting-form"
                className="gap-2"
                disabled={isBusy || isLoadingEntry}
              >
                {isSubmitting || isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                {isSubmitting || isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        }
      >
        {open && isLoadingEntry && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading Direct Contracting details...</span>
          </div>
        )}

        {open && !isLoadingEntry && entryData && (
          <DirectContractingForm
            formId="update-direct-contracting-form"
            onSubmit={handleSubmit}
            initialValues={{
              name: entryData.name || '',
              dcNumber: entryData.dcNumber || '',
              bacProjectId: entryData.bacProjectId || '',
              exclusiveSupplierId: entryData.exclusiveSupplierId || '',
              submissionDeadline: entryData.submissionDeadline
                ? entryData.submissionDeadline.split('T')[0]
                : '',
            }}
            isEdit={true}
            autoDCNumber={entryData.dcNumber}
            resolutionOptions={bacResolutions?.data || []}
            suppliersList={suppliers?.data || []}
          />
        )}
      </ResponsiveDialogDashtail>

    </>
  )
}
