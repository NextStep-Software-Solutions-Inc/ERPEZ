import { useMemo, useState } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { useBacResolutions } from '@/features/procurement/bac-resolution/handlers/hooks'
import { useSuppliers } from '@/components/features/planning/procurement-library'
import { createMutationHookFromTemplate, useQueryClient, type AxiosError } from 'erpez-shared-lib'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/services/utils/messages'
import {
  createDirectContractingRequest,
  type CreateDirectContractingPayload,
} from '../handlers/createDirectContractingRequest'
import { useDirectContractings } from '../handlers/hooks'
import {
  useDirectContractingStore,
  type DirectContracting,
} from '../store/directContractingStore'
import {
  DirectContractingForm,
  type CreateDirectContractingFormValues,
} from './DirectContractingForm'

const useCreateDirectContracting = createMutationHookFromTemplate(
  createDirectContractingRequest,
)

function genDCNumber(entries: { dcNumber?: string }[]): string {
  const year = new Date().getFullYear()
  let maxSeq = 0
  for (const ent of entries) {
    const dc = (ent?.dcNumber ?? '').toString()
    const m = dc.match(new RegExp(`^DC-${year}-(\\d+)$`, 'i'))
    if (m) {
      const seq = parseInt(m[1], 10)
      if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  }
  return `DC-${year}-${String(maxSeq + 1).padStart(4, '0')}`
}

export interface CreateDirectContractingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
}

export function CreateDirectContractingDialog({
  open,
  onOpenChange,
  trigger,
}: CreateDirectContractingDialogProps) {
  const queryClient = useQueryClient()
  const { entries } = useDirectContractingStore()
  const { mutateAsync: createDirectContracting, isPending } = useCreateDirectContracting()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: directContractingsResponse } = useDirectContractings({
    pathParams: {},
    queryParams: { pageSize: 200 },
    enabled: open,
  })

  const { data: bacResolutions } = useBacResolutions({
    pathParams: {},
    queryParams: { pageSize: 200 },
    enabled: open,
  })

  const { data: suppliers } = useSuppliers({
    pathParams: {},
    queryParams: {
      pageSize: 200,
      filters: 'Status==Approved,IsBlacklisted==false',
    },
    enabled: open,
  })

  const dcEntries = useMemo(() => {
    if (directContractingsResponse?.data && Array.isArray(directContractingsResponse.data)) {
      return directContractingsResponse.data
    }
    return entries
  }, [directContractingsResponse, entries])

  const autoDCNumber = useMemo(() => genDCNumber(dcEntries), [dcEntries])

  const handleSubmit = async (values: CreateDirectContractingFormValues) => {
    try {
      setIsSubmitting(true)

      const finalDCNumber = values.dcNumber?.trim() || autoDCNumber
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

      const payload: CreateDirectContractingPayload = {
        name: values.name.trim(),
        dcNumber: finalDCNumber,
        bacProjectId: values.bacProjectId,
        exclusiveSupplierId: values.exclusiveSupplierId,
        submissionDeadline: formattedDeadline,
      }

      await toast.promise(
        createDirectContracting(
          {
            pathParams: {},
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

      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].includes('direct-contracting'),
      })

      onOpenChange(false)
    } catch {
      // toast.promise handles presentation
    } finally {
      setIsSubmitting(false)
    }
  }

  const isBusy = isSubmitting || isPending

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isBusy) onOpenChange(nextOpen)
      }}
      title="Create Direct Contracting Request"
      description="Select an approved BAC Resolution and assign the single exclusive supplier for this proprietary procurement."
      size="lg"
      className="w-full max-h-[85vh]"
      trigger={trigger}
      footer={
        <div className="flex justify-end gap-3 w-full">
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
            form="create-direct-contracting-form"
            className="gap-2"
            disabled={isBusy}
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            {isBusy ? 'Initializing...' : 'Initialize Request'}
          </Button>
        </div>
      }
    >
      {/* Component lifecycle mounting resets form state upon dialog open/close with zero useEffect */}
      {open && (
        <DirectContractingForm
          formId="create-direct-contracting-form"
          onSubmit={handleSubmit}
          autoDCNumber={autoDCNumber}
          resolutionOptions={bacResolutions?.data || []}
          suppliersList={suppliers?.data || []}
        />
      )}
    </ResponsiveDialogDashtail>
  )
}
