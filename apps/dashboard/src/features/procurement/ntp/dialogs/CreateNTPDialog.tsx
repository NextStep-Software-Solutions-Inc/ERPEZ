/**
 * Create NTP Dialog
 * Creates a new RA 12009 Notice to Proceed linked to an approved Contract.
 */

import { useCallback, useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { toast } from 'sonner'
import { CreateNTPForm, type CreateNoticeToProceedFormValues } from '../forms/CreateNTPForm'
import {
  useGetAvailableContractsForNoticeToProceed,
  useCreateNoticeToProceed,
} from '../handlers/hooks'
import { isCreateNTPDialogOpenAtom } from '../atoms/ntpAtoms'

export interface CreateNTPDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  contractId?: string
  onSuccess?: (ntpId: string) => void
}

export function CreateNTPDialog({
  open,
  onOpenChange,
  contractId,
  onSuccess,
}: CreateNTPDialogProps) {
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useAtom(isCreateNTPDialogOpenAtom)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  const dialogOpen = open !== undefined ? open : isDialogOpen
  const handleDialogOpen = useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen)
      } else {
        setIsDialogOpen(newOpen)
      }
    },
    [onOpenChange, setIsDialogOpen]
  )

  const { data: availableContracts = [], isLoading: isLoadingContracts } =
    useGetAvailableContractsForNoticeToProceed(dialogOpen)

  const createMutation = useCreateNoticeToProceed()

  const handleFormSubmit = async (values: CreateNoticeToProceedFormValues) => {
    try {
      const result = await createMutation.mutateAsync({
        contractId: values.contractId,
        ntpNumber: values.ntpNumber?.trim() || undefined,
        ntpDate: values.ntpDate,
        effectivityDate: values.effectivityDate?.trim() || undefined,
        commencementDate: values.commencementDate?.trim() || undefined,
        implementationPeriodDays: values.implementationPeriodDays || undefined,
        implementationPeriodText: values.implementationPeriodText?.trim() || undefined,
        placeOfDelivery: values.placeOfDelivery?.trim() || undefined,
        description: values.description?.trim() || undefined,
        remarks: values.remarks?.trim() || undefined,
      })

      const ntpId = result.data

      toast.success('Notice to Proceed created successfully in Draft status.')
      handleDialogOpen(false)

      if (onSuccess) {
        onSuccess(ntpId)
      } else {
        navigate({
          to: `/v2/notice-to-proceed-ntp/${ntpId}`,
        })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Failed to create Notice to Proceed.')
    }
  }

  return (
    <ResponsiveDialog
      open={dialogOpen}
      onOpenChange={handleDialogOpen}
      title="Create Notice to Proceed (NTP)"
      description="Generate an official Notice to Proceed under RA 12009 for an approved bilateral contract."
      size="xl"
    >
      <CreateNTPForm
        availableContracts={availableContracts}
        selectedContractId={contractId}
        isSubmitting={createMutation.isPending}
        onSubmit={handleFormSubmit}
        onCancel={() => handleDialogOpen(false)}
      />
    </ResponsiveDialog>
  )
}
