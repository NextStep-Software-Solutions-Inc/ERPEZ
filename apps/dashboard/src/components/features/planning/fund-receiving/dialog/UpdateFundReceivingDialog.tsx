import { useEffect } from 'react'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateFundReceivingRequest } from '../handlers/updateFundReceivingRequest'
import { getFundReceivingRequest } from '../handlers/getFundReceivingRequest'
import { getFundSourcesRequest } from '../../fund-source/handlers/getFundSourcesRequest'
import UpdateFundReceivingForm from '../form/UpdateFundReceivingForm'
import {
  closeUpdateDialogAtom,
  updateDialogAtom,
  updateFormDataAtom,
} from '../atoms'
import type { UpdateFundReceivingFormType } from '../form/UpdateFundReceivingForm'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { AlertDialog } from '@/components/ui/alert-dialog'

export const hasUnsavedUpdateFormAtom = atom(false)
interface UpdateFundReceivingDialogProps {
  onUpdated?: (data: UpdateFundReceivingFormType) => void
}

type UpdateFormDataAtomType = Partial<
  Omit<UpdateFundReceivingFormType, 'amount'> & {
    id: string
    amount: string | number
  }
>

const useUpdateFundReceiving = createMutationHookFromTemplate(
  updateFundReceivingRequest,
)
const useFundReceiving = createQueryHookFromTemplate(getFundReceivingRequest)
const useFundSources = createQueryHookFromTemplate(getFundSourcesRequest)

const GET_FUND_RECEIVING_KEY = getFundReceivingRequest

export default function UpdateFundReceivingDialog({
  onUpdated,
}: UpdateFundReceivingDialogProps) {
  const { mutateAsync } = useUpdateFundReceiving()
  const [dialogState, setDialogState] = useAtom(updateDialogAtom)

  const [formData, setFormData] = useAtom(updateFormDataAtom) as [
    UpdateFormDataAtomType,
    (update: (prev: UpdateFormDataAtomType) => UpdateFormDataAtomType) => void,
  ]
  const setHasUnsavedChanges = useSetAtom(hasUnsavedUpdateFormAtom)
  const hasUnsavedChangesValue = useAtomValue(hasUnsavedUpdateFormAtom)

  const closeDialog = useSetAtom(closeUpdateDialogAtom)
  const queryClient = useQueryClient()

  const selectedId = dialogState.selectedId || ''

  // --- Data Fetching ---
  const { data: fundReceivingResponse, isLoading } = useFundReceiving({
    pathParams: { id: selectedId },
    queryParams: {},
    queryOptions: {
      enabled: !!selectedId && dialogState.isOpen,
    },
  } as {
    pathParams: { id: string }
    queryParams: {}
    queryOptions: { enabled: boolean }
  })

  const { data: fundSourcesResponse } = useFundSources({
    pathParams: {},
    queryParams: { pageSize: 100, pageNumber: 1 },
  })

  const fundReceivingData = Array.isArray(fundReceivingResponse?.data)
    ? fundReceivingResponse?.data[0]
    : fundReceivingResponse?.data

  useEffect(() => {
    if (dialogState.selectedId && dialogState.isOpen) {
      void queryClient.invalidateQueries({
        queryKey: [GET_FUND_RECEIVING_KEY, { id: dialogState.selectedId }],
        exact: false,
      })
    }
  }, [dialogState.selectedId, dialogState.isOpen, queryClient])

  useEffect(() => {
    if (fundReceivingData) {
      setFormData(() => ({
        fundSourceId: fundReceivingData.fundSourceId,
        amount:
          fundReceivingData.amount != null
            ? String(fundReceivingData.amount)
            : '',
        description: fundReceivingData.description,
        receivedDate: fundReceivingData.receivedDate,
      }))
      const resolvedFundSource =
        fundReceivingData.fundSource ??
        fundSourcesResponse?.data?.find((f: any) => f.id === fundReceivingData.fundSourceId)
      if (resolvedFundSource) {
        setFormData((prev) => ({ ...prev, FundSource: resolvedFundSource as any }))
      }
      setHasUnsavedChanges(false) // Reset unsaved changes flag on fresh load
    }
  }, [fundReceivingData, setFormData, setHasUnsavedChanges])

  const handleValueChange = (
    fieldName: keyof UpdateFundReceivingFormType,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
    setHasUnsavedChanges(true)
  }
const handleUpdateFundReceiving = (data: UpdateFundReceivingFormType) => {
    if (!selectedId) return

    const { fundSourceId, receivedDate: rawDateString, ...payloadData } = data
    let isoDateString = ''
    if (rawDateString) {
      const date = new Date(`${rawDateString}T00:00:00`)
      isoDateString = date.toISOString()
    }

    const finalPayload = {
      ...payloadData,
      amount: Number(payloadData.amount),
      description: String(payloadData.description),
      receivedDate: isoDateString,
    }

    toast.promise(
      mutateAsync({
        pathParams: { id: selectedId },
        queryParams: {},
        payload: finalPayload,
      }),
      {
        loading: 'Updating fund receive entry...',
        success: () => {
          void queryClient.invalidateQueries({
            predicate: (query) =>
              (typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/received-funds')) ||
              (typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/fund-sources')),
          })
          onUpdated?.(data)
          closeDialog(true)
          return 'Fund receive entry updated successfully!'
        },
        error: 'Failed to update fund receive entry',
      }
    )
  }

  const handleClose = () => {
    if (hasUnsavedChangesValue) {
      setDialogState({ ...dialogState, showUnsavedWarning: true })
    } else {
      closeDialog(true)
      void queryClient.resetQueries({
        queryKey: [GET_FUND_RECEIVING_KEY, { id: selectedId }],
      })
    }
  }

    const baseInitialValues: Partial<UpdateFundReceivingFormType> & {
    id?: string
      FundSource?: any
      amount?: number | undefined | string
    } = {}

    if (fundReceivingData) {
      baseInitialValues.fundSourceId = fundReceivingData.fundSourceId
      baseInitialValues.amount = formData.amount != null ? Number(formData.amount) : fundReceivingData.amount
      baseInitialValues.description = formData.description ?? fundReceivingData.description
      baseInitialValues.receivedDate = formData.receivedDate ?? fundReceivingData.receivedDate
      baseInitialValues.FundSource =
      fundReceivingData.fundSource ??
      fundSourcesResponse?.data?.find((f: any) => f.id === fundReceivingData.fundSourceId)
    }

    const formInitialValues = baseInitialValues
  
     return (
      <>
        {!dialogState.showUnsavedWarning && (
          <ResponsiveDialog
            open={dialogState.isOpen}
            onOpenChange={(open) =>
              open
                ? setDialogState({ ...dialogState, isOpen: true })
                : handleClose()
            }
            title="Edit Receive Fund"
          >
            {isLoading || !fundReceivingData ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <UpdateFundReceivingForm
                onSubmit={handleUpdateFundReceiving}
                onCancel={handleClose}
                onValueChange={handleValueChange}
                initialValues={formInitialValues}
              />
            )}
          </ResponsiveDialog>
        )}
        {dialogState.showUnsavedWarning && (
          <AlertDialog
            open={dialogState.showUnsavedWarning}
            onOpenChange={(open) =>
              setDialogState({ ...dialogState, showUnsavedWarning: open })
            }
          />
        )}
      </>
    )
  }
